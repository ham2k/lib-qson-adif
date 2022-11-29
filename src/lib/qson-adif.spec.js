const { adifToQSON } = require("./qson-adif")
const fs = require("fs")
const path = require("path")

describe("adifToQSON", () => {
  it("should work with LoTW files", () => {
    const lotw = fs.readFileSync(path.join(__dirname, "./samples/ki2d-lotw.adi"), "utf8", (err, data) => data)

    const qson = adifToQSON(lotw)

    expect(qson.qsos.length).toEqual(13)
    expect(qson.qsos[5].start).toEqual("2021-07-05T13:34:00Z")
    expect(qson.qsos[5].startMillis).toEqual(Date.parse("2021-07-05T13:34:00Z"))
    expect(qson.qsos[5].freq).toEqual(14075.9)
    expect(qson.qsos[5].band).toEqual("20m")
    expect(qson.qsos[5].mode).toEqual("FT8")
    expect(qson.qsos[5].our.call).toEqual("KI2D")
    expect(qson.qsos[5].our.dxccCode).toEqual(291)
    expect(qson.qsos[5].our.county).toEqual("US/NY/SULLIVAN")
    expect(qson.qsos[5].our.grid).toEqual("FN21RQ")
    expect(qson.qsos[5].our.ituZone).toEqual(8)
    expect(qson.qsos[5].our.cqZone).toEqual(5)
    expect(qson.qsos[5].their.call).toEqual("WD4CVK")
    expect(qson.qsos[5].their.dxccCode).toEqual(291)
    expect(qson.qsos[5].their.county).toEqual("US/GA/UNION")
    expect(qson.qsos[5].their.grid).toEqual("EM74XU")
    expect(qson.qsos[5].their.ituZone).toEqual(8)
    expect(qson.qsos[5].their.cqZone).toEqual(5)
    expect(qson.qsos[5].qsl.sources).toEqual([
      { via: "lotw", received: "2021-07-06T12:59:09Z", sent: "2021-07-06T12:59:09Z" },
    ])
    expect(qson.qsos[5].qsl.received).toEqual("2021-07-06T12:59:09Z")
  })

  it("should work with QRZ files", () => {
    const lotw = fs.readFileSync(path.join(__dirname, "./samples/ki2d-qrz.adi"), "utf8", (err, data) => data)

    const qson = adifToQSON(lotw)

    expect(qson.qsos.length).toEqual(32)
    expect(qson.qsos[5].start).toEqual("2021-05-04T10:59:00Z")
    expect(qson.qsos[5].startMillis).toEqual(Date.parse("2021-05-04T10:59:00Z"))
    expect(qson.qsos[5].freq).toEqual(7075.82)
    expect(qson.qsos[5].band).toEqual("40m")
    expect(qson.qsos[5].mode).toEqual("FT8")
    expect(qson.qsos[5].our.call).toEqual("KI2D")
    expect(qson.qsos[5].our.country).toEqual("United States")
    expect(qson.qsos[5].our.county).toEqual("US/NY/Sullivan")
    expect(qson.qsos[5].our.grid).toEqual("FN21rq")
    expect(qson.qsos[5].our.ituZone).toEqual(11)
    expect(qson.qsos[5].our.cqZone).toEqual(5)
    expect(qson.qsos[5].their.call).toEqual("PJ4EL")
    expect(qson.qsos[5].their.dxccCode).toEqual(520)
    expect(qson.qsos[5].their.country).toEqual("Bonaire")
    expect(qson.qsos[5].their.county).toEqual(undefined)
    expect(qson.qsos[5].their.continent).toEqual("SA")
    expect(qson.qsos[5].their.grid).toEqual("FK52UE")
    expect(qson.qsos[5].their.ituZone).toEqual(6)
    expect(qson.qsos[5].their.cqZone).toEqual(9)
    expect(qson.qsos[5].qsl.sources).toEqual([
      { via: "qrz", received: "2021-05-09T00:00:00Z", id: "629033963" },
      { via: "lotw", received: "2021-05-10T00:00:00Z", sent: "2021-05-10T00:00:00Z" },
      { via: "card", received: "2021-05-22T00:00:00Z", sent: "2021-05-25T00:00:00Z" },
    ])
    expect(qson.qsos[5].qsl.received).toEqual("2021-05-09T00:00:00Z")
  })

  it("should work with N1MM files", () => {
    const lotw = fs.readFileSync(path.join(__dirname, "./samples/ki2d-n1mm.adi"), "utf8", (err, data) => data)

    const qson = adifToQSON(lotw)

    expect(qson.qsos.length).toEqual(25)
    expect(qson.qsos[5].start).toEqual("2022-02-19T13:21:06Z")
    expect(qson.qsos[5].startMillis).toEqual(Date.parse("2022-02-19T13:21:06Z"))
    expect(qson.qsos[5].freq).toEqual(14065.4)
    expect(qson.qsos[5].band).toEqual("20m")
    expect(qson.qsos[5].mode).toEqual("CW")
    expect(qson.qsos[5].our.call).toEqual("KI2D")
    expect(qson.qsos[5].our.power).toEqual("100")
    expect(qson.qsos[5].their.call).toEqual("HG5D")
    expect(qson.qsos[5].their.cqZone).toEqual(15)
    expect(qson.qsos[5].their.sent).toEqual("599")
    expect(qson.qsos[5].refs[0].type).toEqual("contest")
    expect(qson.qsos[5].refs[0].ref).toEqual("ARRL-DX-CW")
    expect(qson.qsos[5].qsl).toEqual(undefined)
  })

  it("should work with Club Log files", () => {
    const clublog = fs.readFileSync(path.join(__dirname, "./samples/ki2d-clublog.adi"), "utf8", (err, data) => data)

    const qson = adifToQSON(clublog)

    expect(qson.qsos.length).toEqual(14)
    expect(qson.qsos[5].start).toEqual("2020-05-20T01:25:00Z")
    expect(qson.qsos[5].startMillis).toEqual(Date.parse("2020-05-20T01:25:00Z"))
    expect(qson.qsos[5].freq).toEqual(14075.2)
    expect(qson.qsos[5].band).toEqual("20m")
    expect(qson.qsos[5].mode).toEqual("FT8")
    expect(qson.qsos[5].our.call).toEqual(undefined)
    expect(qson.qsos[5].their.call).toEqual("AF4MT")
    expect(qson.qsos[5].their.dxccCode).toEqual(291)
    expect(qson.qsos[5].their.cqZone).toEqual(5)
    expect(qson.qsos[5].their.sent).toEqual("599")
    expect(qson.qsos[5].qsl.sources).toEqual([{ via: "qsl", received: "2020-09-04T00:00:00Z" }])
    expect(qson.qsos[5].qsl.received).toEqual("2020-09-04T00:00:00Z")
  })
})
