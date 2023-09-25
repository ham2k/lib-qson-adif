const { adifToQSON } = require('./qson-adif')
const fs = require('fs')
const path = require('path')

describe('adifToQSON', () => {
  it('should work with LoTW files', () => {
    /* eslint-disable n/handle-callback-err */
    const lotw = fs.readFileSync(path.join(__dirname, './samples/ki2d-lotw.adi'), 'ascii', (err, data) => data)

    const qson = adifToQSON(lotw)

    expect(qson.qsos.length).toEqual(13)
    expect(qson.qsos[5].start).toEqual('2021-07-05T13:34:00Z')
    expect(qson.qsos[5].startMillis).toEqual(Date.parse('2021-07-05T13:34:00Z'))
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
    expect(qson.qsos[5].qsl.sources).toEqual([
      { via: 'lotw', received: '2021-07-06T12:59:09Z', sent: '2021-07-06T12:59:09Z' }
    ])
    expect(qson.qsos[5].qsl.received).toEqual('2021-07-06T12:59:09Z')
  })

  it('should work with QRZ files', () => {
    /* eslint-disable n/handle-callback-err */
    const lotw = fs.readFileSync(path.join(__dirname, './samples/ki2d-qrz.adi'), 'ascii', (err, data) => data)

    const qson = adifToQSON(lotw)

    expect(qson.qsos.length).toEqual(32)
    expect(qson.qsos[5].start).toEqual('2021-05-04T10:59:00Z')
    expect(qson.qsos[5].startMillis).toEqual(Date.parse('2021-05-04T10:59:00Z'))
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
    expect(qson.qsos[5].qsl.sources).toEqual([
      { via: 'qrz', received: '2021-05-09T00:00:00Z', id: '629033963' },
      { via: 'lotw', received: '2021-05-10T00:00:00Z', sent: '2021-05-10T00:00:00Z' },
      { via: 'qsl', received: '2021-05-22T00:00:00Z', sent: '2021-05-25T00:00:00Z' }
    ])
    expect(qson.qsos[5].qsl.received).toEqual('2021-05-09T00:00:00Z')
  })

  it('should work with N1MM files', () => {
    /* eslint-disable n/handle-callback-err */
    const lotw = fs.readFileSync(path.join(__dirname, './samples/ki2d-n1mm.adi'), 'ascii', (err, data) => data)

    const qson = adifToQSON(lotw)

    expect(qson.qsos.length).toEqual(25)
    expect(qson.qsos[5].start).toEqual('2022-02-19T13:21:06Z')
    expect(qson.qsos[5].startMillis).toEqual(Date.parse('2022-02-19T13:21:06Z'))
    expect(qson.qsos[5].freq).toEqual(14065.4)
    expect(qson.qsos[5].band).toEqual('20m')
    expect(qson.qsos[5].mode).toEqual('CW')
    expect(qson.qsos[5].our.call).toEqual('KI2D')
    expect(qson.qsos[5].our.power).toEqual('100')
    expect(qson.qsos[5].their.call).toEqual('HG5D')
    expect(qson.qsos[5].their.cqZone).toEqual(15)
    expect(qson.qsos[5].their.sent).toEqual('599')
    expect(qson.qsos[5].refs[0].type).toEqual('contest')
    expect(qson.qsos[5].refs[0].ref).toEqual('ARRL-DX-CW')
    expect(qson.qsos[5].qsl).toEqual(undefined)
  })

  it('should work with Club Log files', () => {
    /* eslint-disable n/handle-callback-err */
    const clublog = fs.readFileSync(path.join(__dirname, './samples/ki2d-clublog.adi'), 'ascii', (err, data) => data)

    const qson = adifToQSON(clublog)

    expect(qson.qsos.length).toEqual(14)
    expect(qson.qsos[5].start).toEqual('2020-05-20T01:25:00Z')
    expect(qson.qsos[5].startMillis).toEqual(Date.parse('2020-05-20T01:25:00Z'))
    expect(qson.qsos[5].freq).toEqual(14075.2)
    expect(qson.qsos[5].band).toEqual('20m')
    expect(qson.qsos[5].mode).toEqual('FT8')
    expect(qson.qsos[5].our.call).toEqual(undefined)
    expect(qson.qsos[5].their.call).toEqual('AF4MT')
    expect(qson.qsos[5].their.dxccCode).toEqual(291)
    expect(qson.qsos[5].their.cqZone).toEqual(5)
    expect(qson.qsos[5].their.sent).toEqual('599')
    expect(qson.qsos[5].qsl.sources).toEqual([{ via: 'qsl', received: '2020-09-04T00:00:00Z' }])
    expect(qson.qsos[5].qsl.received).toEqual('2020-09-04T00:00:00Z')
  })

  it('should work with MixW files', () => {
    /* eslint-disable n/handle-callback-err */
    const mixw = fs.readFileSync(path.join(__dirname, './samples/wo7r-mixw2.adi'), 'ascii', (err, data) => data)

    const qson = adifToQSON(mixw)

    expect(qson.qsos.length).toEqual(15)
    expect(qson.qsos[5].start).toEqual('2023-04-02T00:08:58Z')
    expect(qson.qsos[5].startMillis).toEqual(Date.parse('2023-04-02T00:08:58Z'))
    expect(qson.qsos[5].end).toEqual('2023-04-02T00:09:57Z')
    expect(qson.qsos[5].endMillis).toEqual(Date.parse('2023-04-02T00:09:57Z'))
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
    /* eslint-disable n/handle-callback-err */
    const pota = fs.readFileSync(path.join(__dirname, './samples/ki2d-pota.adi'), 'ascii', (err, data) => data)

    const qson = adifToQSON(pota)

    expect(qson.qsos.length).toEqual(72)

    expect(qson.qsos[0].start).toEqual('2023-09-07T23:27:27Z')
    expect(qson.qsos[0].freq).toEqual(14290)
    expect(qson.qsos[0].band).toEqual('20m')
    expect(qson.qsos[0].mode).toEqual('SSB')
    expect(qson.qsos[0].our.call).toEqual('KI2D')
    expect(qson.qsos[0].their.call).toEqual('AC9OT')
    expect(qson.qsos[0].their.grid).toEqual('EN52es')
    expect(qson.qsos[0].our.grid).toEqual('FN54ui')
    expect(qson.qsos[0].refs[0].type).toEqual("pota")
    expect(qson.qsos[0].refs[0].name).toEqual("POTA")
    expect(qson.qsos[0].refs[0].ref).toEqual("K-1467")
    expect(qson.qsos[0].refs[0].our.ref).toEqual("K-0001")
    expect(qson.qsos[0].refs[0].their.ref).toEqual("K-1467")
  })


})

