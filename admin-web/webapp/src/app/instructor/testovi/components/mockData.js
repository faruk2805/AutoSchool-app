const mockQuestions = {
    '68e1befb31ff82800e342afd': {
      _id: '68e1befb31ff82800e342afd',
      pitanje: 'Šta je prvi korak pri pružanju prve pomoći?',
      tip: 'prva_pomoc',
      kategorija: 'osnove',
      opcije: [
        'Provjera disanja',
        'Poziv hitne pomoći',
        'Zaustavljanje krvarenja',
        'Provjera svijesti'
      ],
      tacanOdgovor: 'Provjera sigurnosti mjesta'
    },
    '68e1befb31ff82800e342afe': {
      _id: '68e1befb31ff82800e342afe',
      pitanje: 'Kako se zove uzdužni dio kolovoza namijenjen za saobraćaj vozila?',
      tip: 'teorija',
      kategorija: 'put',
      opcije: [
        'Kolovozna traka',
        'Vožna traka', 
        'Saobraćajna traka',
        'Traka za kretanje'
      ],
      tacanOdgovor: 'Vožna traka'
    },
    '68e1befb31ff82800e342aff': {
      _id: '68e1befb31ff82800e342aff',
      pitanje: 'Gdje se smije parkirati vozilo?',
      tip: 'teorija',
      kategorija: 'parkiranje',
      opcije: [
        'Uz desnu ivicu kolovoza',
        'Na pješačkom prelazu',
        'Na raskrsnici',
        'Ispred vatrogasnog ulaza'
      ],
      tacanOdgovor: 'Uz desnu ivicu kolovoza'
    },
    '68e1befb31ff82800e342b00': {
      _id: '68e1befb31ff82800e342b00',
      pitanje: 'Šta označava žuto treptavo svjetlo na semaforu?',
      tip: 'znak',
      kategorija: 'semafor',
      opcije: [
        'Obavezno zaustavljanje',
        'Opasnost i povećana opreznost',
        'Slobodan prolaz',
        'Zabrana prolaza'
      ],
      tacanOdgovor: 'Opasnost i povećana opreznost'
    },
    '68e1befb31ff82800e342b01': {
      _id: '68e1befb31ff82800e342b01',
      pitanje: 'Kada je zabranjeno kretanje vozilom unazad?',
      tip: 'teorija',
      kategorija: 'kretanje',
      opcije: [
        'Na autoputu',
        'U tunelu',
        'Na mostu',
        'Sve navedeno'
      ],
      tacanOdgovor: 'Sve navedeno'
    },
    '68e6ecbaa4720a210e97c070': {
      _id: '68e6ecbaa4720a210e97c070',
      pitanje: 'Šta označava znak "obavezan smjer"?',
      tip: 'znak',
      kategorija: 'znakovi',
      opcije: [
        'Dozvoljeni smjerovi kretanja',
        'Obavezan smjer kretanja',
        'Preporučeni smjer',
        'Zabranjen smjer'
      ],
      tacanOdgovor: 'Obavezan smjer kretanja'
    },
    '68e6e9bda4720a210e97c053': {
      _id: '68e6e9bda4720a210e97c053',
      pitanje: 'Šta označava znak "elektronska naplata putarine"?',
      tip: 'znak',
      kategorija: 'znakovi',
      opcije: [
        'Naplata putarine u gotovini',
        'Elektronska naplata putarine',
        'Besplatna deonica',
        'Kontrola naplate'
      ],
      tacanOdgovor: 'Elektronska naplata putarine'
    }
  };

  // Mock podaci za kandidate
  const mockCandidates = [
    {
      _id: '68eade989edcf654f0b85fe3',
      name: 'Faruk',
      surname: 'Fazlić',
      email: 'faruk.fazlic@example.com',
      jmbg: '0101990123456',
      role: 'candidate',
      status: {
        teorijaPrvaPomoc: true,
        polozio: {
          teoriju: true,
          prvuPomoc: true,
          voznju: false
        }
      },
      instruktor: {
        _id: '68ddb01cebb9729427e99c14',
        name: 'Amir',
        surname: 'Hodžić'
      },
      createdAt: '2023-09-22T08:00:00.000Z'
    },
    {
      _id: '13eade14dasf654f0b85fe3',
      name: 'Haris',
      surname: 'Hadžić',
      email: 'haris.hadzic@example.com',
      jmbg: '0101995123456',
      role: 'candidate',
      status: {
        teorijaPrvaPomoc: false,
        polozio: {
          teoriju: false,
          prvuPomoc: false,
          voznju: false
        }
      },
      instruktor: null,
      createdAt: '2023-11-10T08:00:00.000Z'
    },
    {
      _id: '689dfedcf654f324dfsae33',
      name: 'Lejla',
      surname: 'Karić',
      email: 'lejla.karic@example.com',
      jmbg: '0101998123456',
      role: 'candidate',
      status: {
        teorijaPrvaPomoc: true,
        polozio: {
          teoriju: true,
          prvuPomoc: true,
          voznju: true
        }
      },
      instruktor: {
        _id: '68ddb01cebb9729427e99c14',
        name: 'Amir',
        surname: 'Hodžić'
      },
      createdAt: '2023-08-15T08:00:00.000Z'
    },
    {
      _id: '33eade9khzdcf654f0b853fg',
      name: 'Kenan',
      surname: 'Kovačević',
      email: 'kenan.kovacevic@example.com',
      jmbg: '0101993123456',
      role: 'candidate',
      status: {
        teorijaPrvaPomoc: true,
        polozio: {
          teoriju: true,
          prvuPomoc: false,
          voznju: false
        }
      },
      instruktor: null,
      createdAt: '2023-10-05T08:00:00.000Z'
    }
  ];

  // Mock podaci za rezultate testova
  const mockTestResults = [
    {
      _id: '68e9a41e52a47def786facfd',
      testId: "0313694b-aba3-4553-8c27-ee3a1dcd7de7",
      user: '68eade989edcf654f0b85fe3', // Faruk
      tip: "znak",
      subTip: "kombinovani",
      attemptNumber: 2,
      odgovori: [
        {
          questionId: '68e6ecbaa4720a210e97c070',
          odgovor: "obavezan smjer",
          tacno: true,
          _id: '68e9a41e52a47def786facfe'
        },
        {
          questionId: '68e6e9bda4720a210e97c053',
          odgovor: "elektronska naplata putarine",
          tacno: true,
          _id: '68e9a41e52a47def786facff'
        }
      ],
      correctCount: 2,
      total: 2,
      score: 100,
      passed: true,
      createdAt: '2023-11-20T10:30:00.000Z'
    },
    {
      _id: '68e86866cde7534d8b4b8028',
      user: '68eade989edcf654f0b85fe3', // Faruk
      tip: "prva_pomoc",
      subTip: "zavrsni",
      odgovori: [
        {
          questionId: '68e1befb31ff82800e342afd',
          odgovor: "predhodno se uvjeriti da je radnju moguće obaviti na bezbjedan način;",
          tacno: true,
          _id: '68e86866cde7534d8b4b8029'
        },
        {
          questionId: '68e1befb31ff82800e342afe',
          odgovor: "uzdužni dio kolovoza namijenjen za saobraćaj motornih vozila;",
          tacno: false,
          _id: '68e86866cde7534d8b4b802a'
        }
      ],
      correctCount: 1,
      total: 2,
      score: 50,
      passed: false,
      createdAt: '2023-11-25T14:20:00.000Z'
    },
    {
      _id: 'result3',
      user: '689dfedcf654f324dfsae33', // Lejla
      tip: "teorija",
      subTip: "raskrsnice",
      correctCount: 18,
      total: 20,
      score: 90,
      passed: true,
      odgovori: [
        {
          questionId: '68e1befb31ff82800e342aff',
          odgovor: "uz desnu ivicu kolovoza;",
          tacno: true,
          _id: '68e86866cde7534d8b4b802b'
        },
        {
          questionId: '68e1befb31ff82800e342b00',
          odgovor: "na kretanje sa povećanom opreznošću, i da uređaj za davanje svjetlosnih znakova može biti neispravan;",
          tacno: true,
          _id: '68e86866cde7534d8b4b802c'
        }
      ],
      createdAt: '2023-11-28T09:15:00.000Z'
    },
    {
      _id: 'result4',
      user: '13eade14dasf654f0b85fe3', // Haris
      tip: "znak",
      subTip: "lekcijski",
      correctCount: 7,
      total: 10,
      score: 70,
      passed: false,
      odgovori: [
        {
          questionId: '68e1befb31ff82800e342b01',
          odgovor: "kretati se vozilom unazad;",
          tacno: true,
          _id: '68e86866cde7534d8b4b802d'
        }
      ],
      createdAt: '2023-11-29T16:45:00.000Z'
    },
    {
      _id: 'result5',
      user: '33eade9khzdcf654f0b853fg', // Kenan
      tip: "prva_pomoc",
      subTip: "lekcijski",
      correctCount: 8,
      total: 10,
      score: 80,
      passed: true,
      odgovori: [],
      createdAt: '2023-11-30T11:30:00.000Z'
    },
    {
      _id: 'result6',
      user: '68eade989edcf654f0b85fe3', // Faruk - teorija
      tip: "teorija",
      subTip: "kombinovani",
      correctCount: 25,
      total: 30,
      score: 83,
      passed: true,
      odgovori: [],
      createdAt: '2023-12-01T08:20:00.000Z'
    },
    {
      _id: 'result7',
      user: '68eade989edcf654f0b85fe3', // Faruk - raskrsnice
      tip: "raskrsnice",
      subTip: "zavrsni",
      correctCount: 22,
      total: 25,
      score: 88,
      passed: true,
      odgovori: [],
      createdAt: '2023-12-02T14:30:00.000Z'
    }
  ];
  module.exports = {
  mockQuestions,
  mockCandidates,
  mockTestResults
};