import { AdifParser } from 'adif-parser-ts'
import { bandForFrequency } from '@ham2k/lib-operation-data'

export function adifToQSON (str, options) {
  const qson = parseADIF(str, options)
  qson.version = '0.4'
  return qson
}

function parseADIF (str, options = {}) {
  let headers = {}
  const qsos = [], errors = []

  const adif = AdifParser.parseAdi(cleanupBadADIF(str))

  headers = adif.header

  if (headers?.programid === 'LoTW') {
    options.genericQSL = false
  } else {
    options.genericQSL = 'qsl'
  }

  let qsoCount = 0
  adif.records.forEach((adifQSO) => {
    const qso = parseAdifQSO(adifQSO, options)
    if (qso) {
      qsoCount++
      qso._number = qsoCount
      if (options.source) qso._source = options.source + ":qso-" + qsoCount

      if (qso._error) {
        errors.push(qso)
      } else {
        qsos.push(qso)
      }
    }
  })

  qsos.sort((a, b) => {
    if (a.startOnMillis !== b.startOnMillis) {
      return a.startOnMillis - b.startOnMillis
    } else {
      return a._number - b._number
    }
  })

  return {
    source: 'adif',
    rawHeaders: headers,
    qsos,
    errors
  }
}

function condSet (src, dest, field, destField, f) {
  let val = src[field] ?? src[field + '_intl']

  if (val !== undefined) {
    val = f ? f(val) : val
    dest[destField ?? field] = val
  }

  return val
}

const REGEXP_FOR_EOH = /<BR>(?=(.*)<EOH>)/gi
const REGEXP_FOR_MIXW_BAD_ADIF = /<(PROGRAMID|PROGRAMVERSION)>(.+)([\n\r]+)/gi

function cleanupBadADIF(str) {
  str = str.replaceAll(REGEXP_FOR_EOH, "")
  str = str.replaceAll(REGEXP_FOR_MIXW_BAD_ADIF, (match, p1, p2, p3) => `<${p1}:${p2.length}>${p2}${p3}`)
  return str
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
  const qso = { our: {}, their: {} }
  try {

    condSet(adifQSO, qso.their, 'call', 'call', (x) => x.replace('_', '/'))
    condSet(adifQSO, qso.their, 'contacted_op', 'operator', (x) => x.replace('_', '/'))
    condSet(adifQSO, qso.their, 'eq_call', 'owner', (x) => x.replace('_', '/'))

    condSet(adifQSO, qso.our, 'operator', 'operator', (x) => x.replace('_', '/'))
    condSet(adifQSO, qso.our, 'owner_callsign', 'owner', (x) => x.replace('_', '/'))
    condSet(adifQSO, qso.our, 'operator', 'call', (x) => x.replace('_', '/'))
    condSet(adifQSO, qso.our, 'station_callsign', 'call', (x) => x.replace('_', '/'))

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
      qso.startOn = adifDateToISO(adifQSO.qso_date, adifQSO.time_on || adifQSO.time_off || '000000')
      qso.startOnMillis = Date.parse(qso.startOn).valueOf()
    }

    if (adifQSO.qso_date_off) {
      qso.endOn = adifDateToISO(adifQSO.qso_date_off, adifQSO.time_off || '235959')
      qso.endOnMillis = Date.parse(qso.endOn).valueOf()
    } else if (adifQSO.time_off) {
      qso.endOn = adifDateToISO(adifQSO.qso_date, adifQSO.time_off || '235959')
      qso.endOnMillis = Date.parse(qso.endOn).valueOf()
      if (qso.endOnMillis < qso.startOnMillis) {
        qso.endOnMillis += 24 * 60 * 60 * 1000
        qso.endOn = new Date(qso.endOnMillis).toISOString()
      }
    }

    if (!qso.endOn && qso.startOn) {
      qso.endOn = qso.startOn
      qso.endOnMillis = qso.startOnMillis
    }
    if (!qso.startOn && qso.endOn) {
      qso.startOn = qso.endOn
      qso.startOnMillis = qso.endOnMillis
    }

    condSet(adifQSO, qso.their, 'name', 'name')
    condSet(adifQSO, qso.their, 'cont', 'continent')
    condSet(adifQSO, qso.their, 'country', 'entityName')
    condSet(adifQSO, qso.their, 'country', 'country')
    condSet(adifQSO, qso.their, 'qth', 'qth')
    condSet(adifQSO, qso.their, 'city', 'city')
    condSet(adifQSO, qso.their, 'state', 'state')
    condSet(adifQSO, qso.their, 'region', 'regionCode')
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
    condSet(adifQSO, qso.our, 'my_region', 'regionCode')
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

    // QSL Information
    if (adifQSO.app_qrzlog_qsldate) {
      qso.qsl = qso.qsl ?? {}
      qso.qsl.qrz = { received: true }
      condSet(adifQSO, qso.qsl.qrz, 'app_qrzlog_logid', 'id')
      condSet(adifQSO, qso.qsl.qrz, 'app_qrzlog_qsldate', 'receivedOn', adifDateToISO)
    }

    if (adifQSO.lotw_qslrdate) {
      // QRZ ADIF includes LOTW dates
      qso.qsl = qso.qsl ?? {}
      qso.qsl.lotw = { received: true }
      condSet(adifQSO, qso.qsl.lotw, 'lotw_qslrdate', 'receivedOn', adifDateToISO)
      condSet(adifQSO, qso.qsl.lotw, 'lotw_qslsdate', 'sentOn', adifDateToISO)
    } else if (adifQSO.app_lotw_rxqsl) {
      qso.qsl = qso.qsl ?? {}
      qso.qsl.lotw = { received: true }
      condSet(adifQSO, qso.qsl.lotw, 'app_qrzlog_logid', 'id')
      condSet(adifQSO, qso.qsl.lotw, 'app_lotw_rxqsl', 'receivedOn', (x) => x.replace(/(\d+) (\d+):/, '$1T$2:') + 'Z')
      condSet(adifQSO, qso.qsl.lotw, 'app_lotw_rxqso', 'sentOn', (x) => x.replace(/(\d+) (\d+):/, '$1T$2:') + 'Z')
    } else if (adifQSO.lotw_qsl_rcvd === 'Y') {
      qso.qsl = qso.qsl ?? {}
      qso.qsl.lotw = { received: true }
    }

    if (adifQSO.eqsl_qsl_rcvd === 'Y') {
      qso.qsl = qso.qsl ?? {}
      qso.qsl.eqsl = { received: true }
      condSet(adifQSO, qso.qsl.eqsl, 'eqsl_sql_rdate', 'receivedOn', adifDateToISO)
    }

    if (adifQSO.app_dxkeeper_clublog_qsl_rcvd === 'Y') {
      qso.qsl = qso.qsl ?? {}
      qso.qsl.clublog = { received: true }
      condSet(adifQSO, qso.qsl.clublog, 'app_dxkeeper_clublog_qslrdate', 'receivedOn', adifDateToISO)
    }

    // if (adifQSO.app_dxkeeper_qrzcom_qslrdate) {  // Not reliable right now
    //   qso.qsl = qso.qsl ?? {}
    //   qso.qsl.qrz = { received: true }
    //   condSet(adifQSO, qso.qsl.qrz, 'app_dxkeeper_qrzcom_qslrdate', 'receivedOn', adifDateToISO)
    // }

    if (adifQSO.qsl_rcvd === 'Y' && options.genericQSL) {
      qso.qsl = qso.qsl ?? {}
      qso.qsl.qsl = { received: true }
      condSet(adifQSO, qso.qsl.qsl, 'qslrdate', 'receivedOn', adifDateToISO)
      condSet(adifQSO, qso.qsl.qsl, 'qslsdate', 'sentOn', adifDateToISO)
    }

    Object.keys(qso.qsl || {}).forEach((s) => {
      qso.qsl.received = qso.qsl.received || qso.qsl[s].received

      if (qso.qsl[s].receivedOn) {
        qso.qsl[s].receivedOnMillis = Date.parse(qso.qsl[s].receivedOn).valueOf()
      }

      if (qso.qsl[s].sentOn) {
        qso.qsl[s].sentOnMillis = Date.parse(qso.qsl[s].sentOn).valueOf()
      }
    })

    // References
    if (adifQSO.contest_id) {
      qso.refs = qso.refs ?? []
      qso.refs.push({ type: 'contest', ref: adifQSO.contest_id })
    }

    if (adifQSO.iota) {
      qso.refs = qso.refs ?? []
      const ref = { type: 'iota', ref: adifQSO.iota }
      condSet(adifQSO, ref, 'iota_island_id', 'island')
      qso.refs.push(ref)
    }
    if (adifQSO.my_iota) {
      qso.refs = qso.refs ?? []
      const ref = { type: 'iotaActivation', ref: adifQSO.my_iota }
      condSet(adifQSO, ref, 'my_iota_island_id', 'island')
      qso.refs.push(ref)
    }

    if (adifQSO.sota) {
      qso.refs = qso.refs ?? []
      qso.refs.push({ type: 'sota', ref: adifQSO.sota })
    }
    if (adifQSO.my_sota) {
      qso.refs = qso.refs ?? []
      qso.refs.push({ type: 'sotaActivation', ref: adifQSO.my_sota })
    }

    if (adifQSO.sig || adifQSO.sig_intl || adifQSO.my_sig || adifQSO.my_sig_intl ) {
      const sigType = (adifQSO.sig_intl || adifQSO.my_sig_intl || adifQSO.sig || adifQSO.my_sig ).toLowerCase()

      qso.refs = qso.refs ?? []

      const sigValue = adifQSO.sig_info_intl ?? adifQSO.sig_info
      if (sigValue || adifQSO.sig || adifQSO.sig_intl) qso.refs.push({ type: sigType, ref: sigValue })

      const mySigValue = adifQSO.my_sig_info_intl ?? adifQSO.my_sig_info
      if (mySigValue || adifQSO.my_sig || adifQSO.my_sig_intl) qso.refs.push({ type: `${sigType}Activation`, ref: mySigValue })
    }

    return qso
  } catch (error) {
    qso._error = `${error.name}: ${error.message}`
    console.error(
      `Error parsing ADIF QSO - ${error.name}: ${error.message}`,
      '-- QSO Data:',
      adifQSO,
      '-- Error:',
      error
    )
    return qso
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
    time = [time.substring(0, 2) || '00', time.substring(2, 4) || '00', time.substring(4, 6) || '00'].join(':')
  } else {
    time = '00:00:00'
  }
  return [str.substring(0, 4), str.substring(4, 6), str.substring(6, 8)].join('-') + `T${time}Z`
}

