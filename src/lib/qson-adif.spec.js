import { adifToQSON } from './qson-adif'
import fs from 'fs'

describe('adifToQSON', () => {
  it('should work with LoTW files', () => {
    const lotw = fs.readFileSync('src/lib/samples/ki2d-lotw.adi', 'ascii', (err, data) => data)

    const qson = adifToQSON(lotw)

    // The file has QSOs out of order
    const qsoNumbers = qson.qsos.map((qso) => qso._number)
    const qsoSortedNumbers = qson.qsos.map((qso) => qso._number).sort((a, b) => a - b)
    expect(qsoNumbers).not.toEqual(qsoSortedNumbers)

    // The resulting QSOs should be sorted by time
    const qsoTimes = qson.qsos.map((qso) => qso.startAtMillis)
    const qsoSortedTimes = qson.qsos.map((qso) => qso.startAtMillis).sort((a, b) => a - b)
    expect(qsoTimes).toEqual(qsoSortedTimes)

    expect(qson.qsos.length).toEqual(13)
    expect(qson.qsos[5]._number).toEqual(3)
    expect(qson.qsos[5].startAt).toEqual('2021-07-05T13:34:00Z')
    expect(qson.qsos[5].startAtMillis).toEqual(Date.parse('2021-07-05T13:34:00Z'))
    expect(qson.qsos[5].freq).toEqual(14075.9)
    expect(qson.qsos[5].band).toEqual('20m')
    expect(qson.qsos[5].mode).toEqual('FT8')
    expect(qson.qsos[5].our.call).toEqual('KI2D')
    expect(qson.qsos[5].our.dxccCode).toEqual(291)
    expect(qson.qsos[5].our.county).toEqual('US/NY/SULLIVAN')
    expect(qson.qsos[5].our.grid).toEqual('FN21RQ')
    expect(qson.qsos[5].our.ituZone).toEqual(8)
    expect(qson.qsos[5].our.cqZone).toEqual(5)
    expect(qson.qsos[5].their.call).toEqual('WD4CVK')
    expect(qson.qsos[5].their.dxccCode).toEqual(291)
    expect(qson.qsos[5].their.county).toEqual('US/GA/UNION')
    expect(qson.qsos[5].their.grid).toEqual('EM74XU')
    expect(qson.qsos[5].their.ituZone).toEqual(8)
    expect(qson.qsos[5].their.cqZone).toEqual(5)
    expect(qson.qsos[5].qsl.lotw.receivedOn).toEqual('2021-07-06T12:59:09Z')
    expect(qson.qsos[5].qsl.lotw.sentOn).toEqual('2021-07-06T12:59:09Z')
  })

  it('should work with QRZ files', () => {
    const lotw = fs.readFileSync('src/lib/samples/ki2d-qrz.adi', 'ascii', (err, data) => data)

    const qson = adifToQSON(lotw)

    expect(qson.qsos.length).toEqual(32)
    expect(qson.qsos[5]._number).toEqual(6)
    expect(qson.qsos[5].startAt).toEqual('2021-05-04T10:59:00Z')
    expect(qson.qsos[5].startAtMillis).toEqual(Date.parse('2021-05-04T10:59:00Z'))
    expect(qson.qsos[5].freq).toEqual(7075.82)
    expect(qson.qsos[5].band).toEqual('40m')
    expect(qson.qsos[5].mode).toEqual('FT8')
    expect(qson.qsos[5].our.call).toEqual('KI2D')
    expect(qson.qsos[5].our.country).toEqual('United States')
    expect(qson.qsos[5].our.county).toEqual('US/NY/Sullivan')
    expect(qson.qsos[5].our.grid).toEqual('FN21rq')
    expect(qson.qsos[5].our.ituZone).toEqual(11)
    expect(qson.qsos[5].our.cqZone).toEqual(5)
    expect(qson.qsos[5].their.call).toEqual('PJ4EL')
    expect(qson.qsos[5].their.dxccCode).toEqual(520)
    expect(qson.qsos[5].their.country).toEqual('Bonaire')
    expect(qson.qsos[5].their.county).toEqual(undefined)
    expect(qson.qsos[5].their.continent).toEqual('SA')
    expect(qson.qsos[5].their.grid).toEqual('FK52UE')
    expect(qson.qsos[5].their.ituZone).toEqual(6)
    expect(qson.qsos[5].their.cqZone).toEqual(9)
    expect(qson.qsos[5].qsl).toEqual({
      qrz: { received: true, receivedOn: '2021-05-09T00:00:00Z', receivedOnMillis: 1620518400000, id: '629033963' },
      lotw: { received: true, receivedOn: '2021-05-10T00:00:00Z', receivedOnMillis: 1620604800000, sentOn: '2021-05-10T00:00:00Z', sentOnMillis: 1620604800000 },
      qsl: { received: true, receivedOn: '2021-05-22T00:00:00Z', receivedOnMillis: 1621641600000, sentOn: '2021-05-25T00:00:00Z', sentOnMillis: 1621900800000 },
      received: true
    })
  })

  it('should work with N1MM files', () => {
    const lotw = fs.readFileSync('src/lib/samples/ki2d-n1mm.adi', 'ascii', (err, data) => data)

    const qson = adifToQSON(lotw)

    expect(qson.qsos.length).toEqual(25)
    expect(qson.qsos[5]._number).toEqual(6)
    expect(qson.qsos[5].startAt).toEqual('2022-02-19T13:21:06Z')
    expect(qson.qsos[5].startAtMillis).toEqual(Date.parse('2022-02-19T13:21:06Z'))
    expect(qson.qsos[5].freq).toEqual(14065.4)
    expect(qson.qsos[5].band).toEqual('20m')
    expect(qson.qsos[5].mode).toEqual('CW')
    expect(qson.qsos[5].our.call).toEqual('KI2D')
    expect(qson.qsos[5].our.power).toEqual('100')
    expect(qson.qsos[5].their.call).toEqual('HG5D')
    expect(qson.qsos[5].their.cqZone).toEqual(15)
    expect(qson.qsos[5].their.sent).toEqual('599')
    expect(qson.qsos[5].refs[0]).toEqual({type: 'contest', ref: 'ARRL-DX-CW'})
    expect(qson.qsos[5].qsl).toEqual(undefined)
  })

  it('should work with Club Log files', () => {
    const clublog = fs.readFileSync('src/lib/samples/ki2d-clublog.adi', 'ascii', (err, data) => data)

    const qson = adifToQSON(clublog)

    expect(qson.qsos.length).toEqual(14)
    expect(qson.qsos[5].startAt).toEqual('2020-05-20T01:25:00Z')
    expect(qson.qsos[5].startAtMillis).toEqual(Date.parse('2020-05-20T01:25:00Z'))
    expect(qson.qsos[5].freq).toEqual(14075.2)
    expect(qson.qsos[5].band).toEqual('20m')
    expect(qson.qsos[5].mode).toEqual('FT8')
    expect(qson.qsos[5].our.call).toEqual(undefined)
    expect(qson.qsos[5].their.call).toEqual('AF4MT')
    expect(qson.qsos[5].their.dxccCode).toEqual(291)
    expect(qson.qsos[5].their.cqZone).toEqual(5)
    expect(qson.qsos[5].their.sent).toEqual('599')
    expect(qson.qsos[5].qsl.qsl.receivedOn).toEqual('2020-09-04T00:00:00Z')
    expect(qson.qsos[5].qsl.received).toEqual(true)
  })

  it('should work with MixW files', () => {
    const mixw = fs.readFileSync('src/lib/samples/wo7r-mixw2.adi', 'ascii', (err, data) => data)

    const qson = adifToQSON(mixw)

    expect(qson.qsos.length).toEqual(14)

    expect(qson.qsos[5].startAt).toEqual('2023-04-02T00:08:58Z')
    expect(qson.qsos[5].startAtMillis).toEqual(Date.parse('2023-04-02T00:08:58Z'))
    expect(qson.qsos[5].endAt).toEqual('2023-04-02T00:09:57Z')
    expect(qson.qsos[5].endAtMillis).toEqual(Date.parse('2023-04-02T00:09:57Z'))
    expect(qson.qsos[5].freq).toEqual(144116)
    expect(qson.qsos[5].band).toEqual('2m')
    expect(qson.qsos[5].mode).toEqual('JT65')
    expect(qson.qsos[5].our.call).toEqual('WO7R')
    expect(qson.qsos[5].their.call).toEqual('G8RWG')
    expect(qson.qsos[5].their.cqZone).toEqual(14)
    expect(qson.qsos[5].their.ituZone).toEqual(27)
    expect(qson.qsos[5].their.sent).toEqual('599')
    expect(qson.qsos[5].their.grid).toEqual('IO91')
    expect(qson.qsos[5].their.entityName).toEqual('England')
    expect(qson.qsos[5].their.dxccCode).toEqual(223)
    expect(qson.qsos[5].their.continent).toEqual('EU')
    expect(qson.qsos[5].qsl).toEqual(undefined)
  })

  it('should work with HamRS POTA files', () => {
    const pota = fs.readFileSync('src/lib/samples/ki2d-pota.adi', 'ascii', (err, data) => data)

    const qson = adifToQSON(pota)

    expect(qson.qsos.length).toEqual(72)

    expect(qson.qsos[0].startAt).toEqual('2023-09-07T23:27:27Z')
    expect(qson.qsos[0].freq).toEqual(14290)
    expect(qson.qsos[0].band).toEqual('20m')
    expect(qson.qsos[0].mode).toEqual('SSB')
    expect(qson.qsos[0].our.call).toEqual('KI2D')
    expect(qson.qsos[0].their.call).toEqual('AC9OT')
    expect(qson.qsos[0].their.grid).toEqual('EN52es')
    expect(qson.qsos[0].our.grid).toEqual('FN54ui')
    expect(qson.qsos[0].refs).toEqual([
      { type: 'pota', ref: 'K-1467' },
      { type: 'potaActivation', ref: 'K-0001' },
    ])
  })

  it('should work with Logger32 files', () => {
    const clublog = fs.readFileSync('src/lib/samples/k0xm-logger32.adi', 'ascii', (err, data) => data)

    const qson = adifToQSON(clublog)

    expect(qson.qsos.length).toEqual(1015)

    expect(qson.qsos[5].startAt).toEqual('2023-01-11T01:41:19Z')
    expect(qson.qsos[5].startAtMillis).toEqual(Date.parse('2023-01-11T01:41:19Z'))
    expect(qson.qsos[5].freq).toEqual(14076.11)
    expect(qson.qsos[5].band).toEqual('20m')
    expect(qson.qsos[5].mode).toEqual('FT8')
    expect(qson.qsos[5].our.call).toEqual('K0XM')
    expect(qson.qsos[5].their.call).toEqual('4S7AVR')
    expect(qson.qsos[5].their.dxccCode).toEqual(315)
    expect(qson.qsos[5].their.cqZone).toEqual(22)
    expect(qson.qsos[5].their.sent).toEqual('-19')
  })

  it('should work with LogHK files', () => {
    const clublog = fs.readFileSync('src/lib/samples/r6yy-loghk.adi', 'ascii', (err, data) => data)

    const qson = adifToQSON(clublog)

    expect(qson.qsos.length).toEqual(423)

    expect(qson.qsos[5].startAt).toEqual('2024-01-01T04:00:00Z')
    expect(qson.qsos[5].startAtMillis).toEqual(Date.parse('2024-01-01T04:00:00Z'))
    expect(qson.qsos[5].freq).toEqual(3576.37)
    expect(qson.qsos[5].band).toEqual('80m')
    expect(qson.qsos[5].mode).toEqual('MFSK')
    expect(qson.qsos[5].our.call).toEqual('R6YY')
    expect(qson.qsos[5].their.call).toEqual('F5MXH')
    expect(qson.qsos[5].their.dxccCode).toEqual(227)
    expect(qson.qsos[5].their.cqZone).toEqual(14)
    expect(qson.qsos[5].their.sent).toEqual('+05')

    expect(qson.qsos[6].startAt).toEqual('2024-01-01T04:04:00Z')
    expect(qson.qsos[6].startAtMillis).toEqual(Date.parse('2024-01-01T04:04:00Z'))
  })

})

