# QSO Object Notation

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

This also means trying to use predictable key names, and human readable values even if an app does not know what they mean. For example, don't use `{ contest: "CQWPX" }`, but rather `{ type: "contest", id: "CQWPX" }`

# Structure

Main components:

- `.` : (the root level of the object) attributes common to both parties in the contact (even if they have been recorded from the point of view of the operator doing the logging).

Examples: `start`, `end`, `band`, `mode`, `freq`.

- Two sets of "operator" attributes: `ours` and `theirs`.

Both sets have the same kind of fields, including `call`, `name`, `exchange` (sent), `address`, etc, etc.

- `qsl` : attributes pertaining to the confirmation of the contact.

Examples: TKTKTK

- `refs` : References to specific operations, activities or awards.

A list of objects with at least `type` ("contest", "award", "net", etc) and `id` ("IOTA", "NATA", "DXCC") attributes.

- `sources` : A list of objects, each with a `source` attribute and different fragments of information following the QSON notation (yes, recursion!) obtained from each different source.

The most common `source` would be "log", representing the bits of information logged by the user, along, for example, data retrieved from "qrz.com" such as name and location of the other operator, under `their`, and perhaps information coming from "pota.app" with details of a POTA activation.

All these "sources" are merged together to provide the main, summarized information in the root object `qso`, `ours`, `theirs`, `qsl` and `refs` keys.

# Open Questions

Is "activity" a good name for the different "things" (contests, awards, nets, operations, programmes) a QSO might be part of?
Or perhaps "reference"? As in "in reference to ..."? Or "related", shortened to "rel" or "rels"? What about "ops"?

Should we identify activities hierarchically? Like "Contest/CQWPX" and "Net/NATA" and "Award/DXCC" ? or using two fields like `type` and `id`?

Do we need to worry about mix-mode QSOs?

A few attributes, such as `grid` or `county`, have the potential of having multiple values for a single QSO, but 99% of the time they are just single values. Perhaps we can manage this by using `moreGrids` and `moreCounties` in those special cases? Or just have `grids` and `counties` always as arrays?

How do we handle lists/groups of QSOs? Do we need to store common attributes (such as contest refs) for a list?

# Example

```
{
  freq: "14.176",
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
    freq: "14.1765",
  },
  qsl: {
    sources: [
      { source: "lotw", recordId: 1572527764 },
      { source: "card" },
      { source: "qrz" },
      { source: "clublog" }
    ]
  },
  refs: [
    {
      type: "iota",
      ref: "NA-1234",
      role: "hunter"
    },
    {
      type: "pota",
      ref: "K-0123"
      role: "activator"
    },
    {
      type: "bota",
      ref: "K-0123"
      role: "activator"
    },
    {
      type: "contest"
      ref: "NAQPSSB"
      transmitter: 0,
      mults: ["K2"]
    },
    {
      type: "net",
      ref: "NATA"
    },
    {
      type: "award",
      ref: "USACA",
      county: "USA/NY/Sullivan"
    }
  ],
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
