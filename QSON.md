# QSO Object Notation

VERSION 0.4

A JSON-like object notation for representation of Amateur Radio log data, with an emphasis on legibility and clarity over storage efficiency.

It is inspired by other Amateur Radio formats such as [ADIF](https://www.adif.org/) and [Cabrillo](https://wwrof.org/cabrillo/).

# What is a QSO?

One QSO represents a contact between two stations, as seen by one of them. The term "QSO" comes from standard radio abbreviations, also known as "procodes", and corresponds to the question or assertion of "I can communicate with you".

A QSL is when the other station has confirmed the contact.

# Philosophy

1- Simple cases should be easy, hard cases should be possible.

There are lots of edge cases in ham radio logging. Let's make sure we can deal with them, but make sure first that common, simple cases are easy to manage.

2- We're optimizing for usability and interoperability first, performance second, and storage size last.

As large as one's logbook might seem, it will always be tiny by modern computing standards. Make the data human-readable and easy to understand and don't worry about memory or disk space.

3- We don't know all the use cases.

Make the format easily extensible. Allow for unexpected keys or values. Make it easy to write programs that use the data they know about, and ignore anything else.

# Structure

Main components:

- `.` : (the root level of the object) attributes common to both parties in the contact (even if they have been recorded from the point of view of the operator doing the logging).

Examples: `startOn`, `endOn`, `band`, `mode`, `freq`.

- Two sets of "operator" attributes: `ours` and `theirs`.

Both sets have the same kind of fields, including `call`, `name`, `exchange` (sent), `address`, etc, etc.

- `qsl` : attributes pertaining to the confirmation of the contact.

A hash of sources, each with a hash of attributes. Each source can have a `received` key with a boolean value, indicating whether the contact has been confirmed via that source. It can also have `receivedOn` and `sentOn` keys with a date values, along with other source-specific information.

There is also a top-level `qsl.received` key with a boolean value, indicating whether the contact has been confirmed by any source.

- `refs` : References to specific operations, activities or awards.

An array of hashes, each with a `type` key and a `ref` key.

The `type` can be something like "pota" or "sota" or "contest". The `ref` is a string reference unique to the type,
such as "K-1234" for `pota` or "NAQPSSB" for `contest`.

The hash can contain additional information specific to the reference type. For example, for a contest, it can contain the transmitter number and the multipliers worked.

For "asymetrical" activities like POTA, SOTA, etc, the default reference is for hunting, and a separate reference for activating is provided under `potaActivation`.

# Special Cases

### Multiple Values

A few keys have the potential of having multiple values for a single QSO, but 99% of the time they are just single values.
For example, `grid`, or `county`. Or a single QSO that references to two contests or two POTA parks.

In these cases, we append numbers to the attribute name, starting with "2". So for example, a QSO with 3 grids would have `grid`, `grid2` and `grid3`. A QSO with 2 contests would have `refs.contest` and `refs.contest2`.

### Discardable values

Some applications might include keys and values that are not relevant to the QSO itself, but to the application, and do not need to be preserved by other applications. These keys should start with an underscode `_`. For example, a log-parsing library might include `_number` and `_line` keys to indicate the position of a QSO in the log file.

# Open Questions

Do we need to worry about mix-mode QSOs?

# Data References

[ISO 3166-2](https://en.wikipedia.org/wiki/ISO_3166-2) Countries and their subdivisions (states, provinces, etc)

# Example

```
{
  freq: 14176,
  band: "20m",
  mode: "USB",
  modegroup: "PHONE",
  start: "2020-01-01T10:31:00Z",
  end: "2020-01-01T10:32:15Z",
  confirmed: "2021-01-01T10:32:15Z",
  verified: "2022-01-01T10:32:15Z",
  our: {
    call: "KI2D",
    grid: "FN21rq",
    report: "59",
    name: "DAN",
    state: "NY"
  },
  their: {
    call: "K2SUL",
    report: "55",
    name: "JOHN",
    state: "NY"
    freq: 141765,
  },
  qsl: {
    lotw: { recordId: 1572527764, received: "2023-01-15"  },
    qsl: { qsl: true },
    qrz: { qsl: true },
    clublog: { qsl: true },
  },
  refs: {
    iota: { "NA-1234": true },
    potaActivation: { "K-0123": true },
    contest: {
      NAQPSSB: {
        transmitter: 0,
        mults: ["K2"]
      }
    },
    net: {
      "NATA": true
    }
    award: {
      "USACA": {
        county: "USA/NY/Sullivan"
      }
    }
  },
  sources: [
    {
      freq: "14.176",
      mode: "USB",
      start: "2020-01-01T10:31:00Z",
      end: "2020-01-01T10:32:15Z",
      source: "adif",
      our: {
        call: "KI2D",
        report: "59",
      },
      their: {
        call: "K2SUL",
        report: "55",
      },
      qsl: {
        confirmed: true,
        verified: true,
        sources: [
          {
            source: "LoTW",
            sentOn: 20210531,
            receivedOn: 20210531
          }
        ]
      }
      refs: [
        {
          type: "Contest"
          ref: "NAQPSSB"
          transmitter: 0,
          mults: ["K2"]
        },
      ],
      raw: {
        ...
      }
    },
    {
      source: "qrz.com",
      their: {
        name: "John Lavelle",
        qth: "Wurstboro",
        state: "US/NY",
        county: "US/NY/Sullivan",
        grid: "FN21so",
        ituzone: 8,
        cqzone: 5,
      }
    },
    {
      source: "lotw",
      their: {
        name: "John Lavelle",
        qth: "Wurstboro",
        state: "US/NY",
        county: "US/NY/Sullivan",
        grid: "FN21so",
        ituzone: 8,
        cqzone: 5,
      },
      updated: "2021-12-29 20:44:13",
      qsl: {
        confirmed: "2022-01-01 15:44:16",
        verified: "2022-12-01 15:44:16",
        sources: [
          {
            source: "LoTW",
            sent: "2021-01-01 15:44:16",
            confirmed: "2022-01-01 15:44:16",
            verified: "2022-12-01 15:44:16",
            recordId: 1572527764
          }
        ]
      }
    },
    {
      source: "clublog",
      ...
    },
    {
      source: "callook",
      ...
    },
    {
      source: "hamqth",
      raw: {
        callsign: "ok2cqr",
        nick: "Petr",
        qth: "Neratovice",
        country: "Czech Republic",
        adif: "503",
        itu: "28",
        cq: "15",
        grid: "jo70gg",
        adr_name: "Petr Hlozek",
        adr_street1: "17. listopadu 1065",
        adr_city: "Neratovice",
        adr_zip: "27711",
        adr_country: "Czech Republic",
        adr_adif: "503",
        district: "GZL",
        lotw: "Y",
        qsl: "Y",
        qsldirect: "Y",
        eqsl: "Y",
        email: "petr@ok2cqr.com",
        jabber: "petr@ok2cqr.com",
        skype: "PetrHH",
        birth_year: "1982",
        lic_year: "1998",
        web: "https://www.ok2cqr.com",
        latitude: "50.07",
        longitude: "14.42",
        continent: "EU",
        utc_offset: "-1",
        picture: "https://www.hamqth.com/userfiles/o/ok/ok2cqr/_profile/ok2cqr_nove.jpg",
      }
    },
  ]
}
```
