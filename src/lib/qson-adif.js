const { AdifParser } = require('adif-parser-ts')
const { bandForFrequency } = require('@ham2k/lib-operation-data')

function adifToQSON (str) {
  return parseADIF(str)
}

function parseADIF (str, options = {}) {
  let headers = {}
  const qsos = []

  let qsoCount = 0

  const adif = AdifParser.parseAdi(str)

  headers = adif.header

  if (headers?.programid === 'LoTW') {
    options.genericQSL = false
  } else if (headers?.programid === 'Club Log') {
    options.genericQSL = 'qsl'
  } else {
    options.genericQSL = 'card'
  }

  adif.records.forEach((adifQSO) => {
    const qso = parseAdifQSO(adifQSO, options)
    if (qso) {
      qsoCount++
      qso.number = qsoCount
      qsos.push(qso)
    }
  })

  qsos.sort((a, b) => {
    if (a.startMillis !== b.startMillis) {
      return a.startMillis - b.startMillis
    } else {
      return a.number - b.number
    }
  })

  return {
    source: 'adif',
    rawHeaders: headers,
    qsos
  }
}

function condSet (src, dest, field, destField, f) {
  if (src[field]) {
    if (f) {
      dest[destField ?? field] = f(src[field])
    } else {
      dest[destField ?? field] = src[field]
    }
  }
}

const REGEXP_FOR_US_COUNTRY = /(United States|Hawaii|Alaska)/i
const REGEXP_FOR_OTHER_COUNTRIES_WITH_COUNTIES = /(Puerto Rico)/i

function cleanupCounty (country, county) {
  if (country?.match(REGEXP_FOR_US_COUNTRY)) {
    return `US/${county.replace(/,\s*/, '/')}`
  } else if (country?.match(REGEXP_FOR_OTHER_COUNTRIES_WITH_COUNTIES)) {
    return county.replace(/,\s*/, '/')
  } else {
    return `??/${county.replace(/,\s*/, '/')}`
  }
}

function parseAdifQSO (adifQSO, options) {
  try {
    const qso = { our: {}, their: {} }

    condSet(adifQSO, qso.our, 'operator', 'operator', (x) => x.replace('_', '/'))
    condSet(adifQSO, qso.our, 'station_callsign', 'call', (x) => x.replace('_', '/'))
    condSet(adifQSO, qso.their, 'call', 'call', (x) => x.replace('_', '/'))

    qso.freq = parseFrequency(adifQSO.freq)
    qso.band = (adifQSO.band && adifQSO.band.toLowerCase()) || bandForFrequency(qso.freq)

    if (adifQSO.freq_rx) {
      const rx = parseFrequency(adifQSO.freq_rx)
      if (rx !== qso.freq) {
        qso.their.freq = parseFrequency(adifQSO.freq_rx)
        qso.their.band = adifQSO.band_rx || bandForFrequency(qso.their.freq)
      }
    }

    qso.mode = adifQSO.mode

    if (adifQSO.qso_date) {
      qso.start = adifDateToISO(adifQSO.qso_date, adifQSO.time_on || '00:00:00')
      qso.startMillis = Date.parse(qso.start).valueOf()
    }

    if (adifQSO.qso_date_off) {
      qso.end = adifDateToISO(adifQSO.qso_date_off, adifQSO.time_off || '23:59:59')
      qso.endMillis = Date.parse(qso.end).valueOf()
    } else if (adifQSO.time_off) {
      qso.end = adifDateToISO(adifQSO.qso_date, adifQSO.time_off || '23:59:59')
      qso.endMillis = Date.parse(qso.end).valueOf()
    }

    if (!qso.end && qso.start) {
      qso.end = qso.start
      qso.endMillis = qso.startMillis
    }
    if (!qso.start && qso.end) {
      qso.start = qso.end
      qso.startMillis = qso.endMillis
    }

    if (adifQSO.app_qrzlog_qsldate) {
      qso.qsl = qso.qsl ?? {}
      qso.qsl.sources = qso.qsl.sources ?? []
      const data = { via: 'qrz' }
      condSet(adifQSO, data, 'app_qrzlog_logid', 'id')
      data.received = adifDateToISO(adifQSO.app_qrzlog_qsldate)
      qso.qsl.sources.push(data)
    }

    if (adifQSO.lotw_qslrdate) {
      // QRZ ADIF includes LOTW dates
      qso.qsl = qso.qsl ?? {}
      qso.qsl.sources = qso.qsl.sources ?? []
      const data = { via: 'lotw' }
      condSet(adifQSO, data, 'lotw_qslrdate', 'received', adifDateToISO)
      condSet(adifQSO, data, 'lotw_qslsdate', 'sent', adifDateToISO)
      qso.qsl.sources.push(data)
    } else if (adifQSO.app_lotw_rxqsl) {
      qso.qsl = qso.qsl ?? {}
      qso.qsl.sources = qso.qsl.sources ?? []
      const data = { via: 'lotw' }
      condSet(adifQSO, data, 'app_lotw_rxqsl', 'received', (x) => x.replace(/(\d+) (\d+):/, '$1T$2:') + 'Z')
      condSet(adifQSO, data, 'app_lotw_rxqso', 'sent', (x) => x.replace(/(\d+) (\d+):/, '$1T$2:') + 'Z')
      qso.qsl.sources.push(data)
    } else if (adifQSO.lotw_qsl_rcvd === 'Y') {
      qso.qsl = qso.qsl ?? {}
      qso.qsl.sources = qso.qsl.sources ?? []
      const data = { via: 'lotw' }
      qso.qsl.sources.push(data)
    }

    if (adifQSO.eqsl_qsl_rcvd === 'Y') {
      qso.qsl = qso.qsl ?? {}
      qso.qsl.sources = qso.qsl.sources ?? []
      const data = { via: 'eqsl' }
      condSet(adifQSO, data, 'eqsl_sql_rdate', 'received', adifDateToISO)
      qso.qsl.sources.push(data)
    }

    if (adifQSO.qsl_rcvd === 'Y' && options.genericQSL) {
      qso.qsl = qso.qsl ?? {}
      qso.qsl.sources = qso.qsl.sources ?? []
      const data = { via: options.genericQSL }

      condSet(adifQSO, data, 'qslrdate', 'received', adifDateToISO)
      condSet(adifQSO, data, 'qslsdate', 'sent', adifDateToISO)
      qso.qsl.sources.push(data)
    }

    if (qso.qsl && qso.qsl.sources) {
      qso.qsl.sources.forEach((s) => {
        if (s.received) {
          const millis = Date.parse(s.received).valueOf()
          if (!qso.qsl.receivedMillis || millis < qso.qsl.receivedMillis) {
            qso.qsl.received = s.received
            qso.qsl.receivedMillis = millis
          }
        }
      })
    }

    condSet(adifQSO, qso.their, 'name', 'name')
    condSet(adifQSO, qso.their, 'cont', 'continent')
    condSet(adifQSO, qso.their, 'country', 'entityName')
    condSet(adifQSO, qso.their, 'country', 'country')
    condSet(adifQSO, qso.their, 'qth', 'qth')
    condSet(adifQSO, qso.their, 'city', 'city')
    condSet(adifQSO, qso.their, 'state', 'state')
    condSet(adifQSO, qso.their, 'rst_rcvd', 'sent')
    condSet(adifQSO, qso.their, 'cnty', 'county', (x) => cleanupCounty(qso.their.country, x))
    condSet(adifQSO, qso.their, 'cqz', 'cqZone', (x) => parseInt(x, 10))
    condSet(adifQSO, qso.their, 'cq_zone', 'cqZone', (x) => parseInt(x, 10))
    condSet(adifQSO, qso.their, 'ituz', 'ituZone', (x) => parseInt(x, 10))
    condSet(adifQSO, qso.their, 'itu_zone', 'ituZone', (x) => parseInt(x, 10))
    condSet(adifQSO, qso.their, 'dxcc', 'dxccCode', (x) => parseInt(x, 10))
    condSet(adifQSO, qso.their, 'email', 'email')
    condSet(adifQSO, qso.their, 'gridsquare', 'grid')
    condSet(adifQSO, qso.their, 'lat', 'lat')
    condSet(adifQSO, qso.their, 'lon', 'lon')
    condSet(adifQSO, qso.their, 'ituPrefix', 'entityPrefix')

    condSet(adifQSO, qso.our, 'my_name', 'name')
    condSet(adifQSO, qso.our, 'my_cont', 'continent')
    condSet(adifQSO, qso.our, 'my_country', 'entityName')
    condSet(adifQSO, qso.our, 'my_country', 'country')
    condSet(adifQSO, qso.our, 'my_qth', 'qth')
    condSet(adifQSO, qso.our, 'my_city', 'city')
    condSet(adifQSO, qso.our, 'my_state', 'state')
    condSet(adifQSO, qso.our, 'my_rst_sent', 'sent')
    condSet(adifQSO, qso.our, 'my_cnty', 'county', (x) => cleanupCounty(qso.our.country, x))
    condSet(adifQSO, qso.our, 'my_cqz', 'cqZone', (x) => parseInt(x, 10))
    condSet(adifQSO, qso.our, 'my_cq_zone', 'cqZone', (x) => parseInt(x, 10))
    condSet(adifQSO, qso.our, 'my_ituz', 'ituZone', (x) => parseInt(x, 10))
    condSet(adifQSO, qso.our, 'my_itu_zone', 'ituZone', (x) => parseInt(x, 10))
    condSet(adifQSO, qso.our, 'my_dxcc', 'dxccCode', (x) => parseInt(x, 10))
    condSet(adifQSO, qso.our, 'my_email', 'email')
    condSet(adifQSO, qso.our, 'my_gridsquare', 'grid')
    condSet(adifQSO, qso.our, 'my_lat', 'lat')
    condSet(adifQSO, qso.our, 'my_lon', 'lon')
    condSet(adifQSO, qso.our, 'my_pfx', 'entityPrefix')

    condSet(adifQSO, qso.our, 'tx_pwr', 'power')

    if (adifQSO.contest_id) {
      qso.refs = qso.refs ?? []
      qso.refs.push({ type: 'contest', ref: adifQSO.contest_id })
      if (adifQSO.srx) {
        qso.their.sent = qso.their.sent + ' ' + adifQSO.srx
      }
      if (adifQSO.stx) {
        qso.our.sent = qso.our.sent + ' ' + adifQSO.stx
      }
    }

    if (adifQSO.iota) {
      qso.refs = qso.refs ?? []
      qso.refs.push({ type: 'iota', ref: adifQSO.iota })
    }

    return qso
  } catch (error) {
    console.error(
      `Error parsing ADIF QSO - ${error.name}: ${error.message}`,
      '-- QSO Data:',
      adifQSO,
      '-- Error:',
      error
    )
    return false
  }
}

const REGEXP_FOR_NUMERIC_FREQUENCY = /^[\d.]+$/

function parseFrequency (freq) {
  if (freq && freq.match(REGEXP_FOR_NUMERIC_FREQUENCY)) {
    const n = Number.parseFloat(freq) * 1000
    return Math.round((n + Number.EPSILON) * 100) / 100
  } else {
    return freq
  }
}

function adifDateToISO (str, time) {
  if (time && time.indexOf(':')) {
    time = [time.substr(0, 2) || '00', time.substr(2, 2) || '00', time.substr(4, 2) || '00'].join(':')
  } else {
    time = '00:00:00'
  }
  return [str.substr(0, 4), str.substr(4, 2), str.substr(6, 2)].join('-') + `T${time}Z`
}

module.exports = {
  adifToQSON
}
