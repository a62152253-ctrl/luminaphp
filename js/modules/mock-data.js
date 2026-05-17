export function getMockBusinesses() {
  return [
    { id:'1', name:'Barber Shop Pro', category:'Barber', city:'Warszawa', address:'Marszałkowska 10', rating:4.9,
      photoURL:'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&w=800',
      description:'Najlepszy barber w mieście. Klasyczne i nowoczesne stylizacje.', lat:52.229, lng:21.012 },
    { id:'2', name:'Lash & Brow Studio', category:'Brwi i Rzęsy', city:'Warszawa', address:'Hoża 42', rating:4.8,
      photoURL:'https://images.unsplash.com/photo-1522337660859-02fbefca4702?auto=format&fit=crop&w=800',
      description:'Twoje spojrzenie to nasza pasja. Lamination, lifting, stylizacja.', lat:52.221, lng:21.017 },
    { id:'3', name:'Zen Massage', category:'Masaż', city:'Warszawa', address:'Nowy Świat 5', rating:5.0,
      photoURL:'https://images.unsplash.com/photo-1544161515-4af6b1d462c2?auto=format&fit=crop&w=800',
      description:'Oaza spokoju w sercu miasta. Masaż relaksacyjny, tajski i leczniczy.', lat:52.234, lng:21.003 },
    { id:'4', name:'Nail Art Studio', category:'Paznokcie', city:'Kraków', address:'Floriańska 12', rating:4.7,
      photoURL:'https://images.unsplash.com/photo-1604654894610-df63bc536371?auto=format&fit=crop&w=800',
      description:'Twoje paznokcie w najlepszych rękach. Manicure, pedicure, żel, akryl.', lat:50.062, lng:19.938 },
    { id:'5', name:'Beauty Fryzjer', category:'Fryzjer', city:'Kraków', address:'Grodzka 3', rating:4.6,
      photoURL:'https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=800',
      description:'Strzyżemy z pasją od 2010. Koloryzacja, stylizacja, keratyna.', lat:50.054, lng:19.935 },
    { id:'6', name:'Skin Lab', category:'Kosmetyczka', city:'Gdańsk', address:'Długa 8', rating:4.9,
      photoURL:'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&w=800',
      description:'Zabiegi pielęgnacyjne najwyższej jakości. Mezoterapia, peeling, oczyszczanie.', lat:54.352, lng:18.647 },
  ];
}

export function getMockServices(bizId) {
  const map = {
    '1': [
      { id:'s1', name:'Strzyżenie', price:80, duration:45 },
      { id:'s2', name:'Strzyżenie + broda', price:120, duration:60 },
      { id:'s3', name:'Broda', price:60, duration:30 },
      { id:'s4', name:'Stylizacja', price:50, duration:30 },
    ],
    '2': [
      { id:'s1', name:'Lifting rzęs', price:180, duration:60 },
      { id:'s2', name:'Laminacja brwi', price:120, duration:45 },
      { id:'s3', name:'Henna rzęs', price:80, duration:30 },
      { id:'s4', name:'Depilacja brwi', price:50, duration:20 },
    ],
    '3': [
      { id:'s1', name:'Masaż relaksacyjny (60min)', price:180, duration:60 },
      { id:'s2', name:'Masaż tajski (90min)', price:250, duration:90 },
      { id:'s3', name:'Masaż pleców', price:120, duration:45 },
      { id:'s4', name:'Masaż czaszkowo-krzyżowy', price:200, duration:60 },
    ],
    '4': [
      { id:'s1', name:'Manicure hybrydowy', price:120, duration:60 },
      { id:'s2', name:'Pedicure', price:100, duration:60 },
      { id:'s3', name:'Żel na naturalną płytkę', price:150, duration:75 },
      { id:'s4', name:'Zdobienie paznokci', price:50, duration:30 },
    ],
    '5': [
      { id:'s1', name:'Strzyżenie damskie', price:120, duration:60 },
      { id:'s2', name:'Koloryzacja', price:280, duration:120 },
      { id:'s3', name:'Keratyna', price:350, duration:150 },
      { id:'s4', name:'Modelowanie lokówką', price:80, duration:45 },
    ],
    '6': [
      { id:'s1', name:'Oczyszczanie wodorowe', price:250, duration:75 },
      { id:'s2', name:'Mezoterapia igłowa', price:350, duration:60 },
      { id:'s3', name:'Peeling kawitacyjny', price:180, duration:45 },
      { id:'s4', name:'Konsultacja kosmetologiczna', price:80, duration:30 },
    ],
  };
  return map[bizId] || [
    { id:'s1', name:'Usługa podstawowa', price:100, duration:45 },
    { id:'s2', name:'Usługa premium', price:180, duration:90 },
  ];
}

export function getMockStaff(bizId) {
  const map = {
    '1': [
      { id:'st1', name:'Marek K.', title:'Senior Barber', photoURL:'https://i.pravatar.cc/200?img=11' },
      { id:'st2', name:'Tomek W.', title:'Barber', photoURL:'https://i.pravatar.cc/200?img=12' },
      { id:'st3', name:'Piotr D.', title:'Junior Barber', photoURL:'https://i.pravatar.cc/200?img=13' },
    ],
    '2': [
      { id:'st1', name:'Kasia M.', title:'Stylistka rzęs', photoURL:'https://i.pravatar.cc/200?img=20' },
      { id:'st2', name:'Marta L.', title:'Brow Artist', photoURL:'https://i.pravatar.cc/200?img=21' },
    ],
    '3': [
      { id:'st1', name:'Anna P.', title:'Masażystka', photoURL:'https://i.pravatar.cc/200?img=15' },
      { id:'st2', name:'Jan R.', title:'Terapeuta', photoURL:'https://i.pravatar.cc/200?img=14' },
    ],
    '4': [
      { id:'st1', name:'Natalia S.', title:'Nail Artist', photoURL:'https://i.pravatar.cc/200?img=25' },
      { id:'st2', name:'Zofia B.', title:'Junior Nail Artist', photoURL:'https://i.pravatar.cc/200?img=26' },
    ],
    '5': [
      { id:'st1', name:'Ewa M.', title:'Senior Stylistka', photoURL:'https://i.pravatar.cc/200?img=30' },
      { id:'st2', name:'Dorota K.', title:'Kolorystka', photoURL:'https://i.pravatar.cc/200?img=31' },
    ],
    '6': [
      { id:'st1', name:'Dr Agata W.', title:'Kosmetolog', photoURL:'https://i.pravatar.cc/200?img=35' },
      { id:'st2', name:'Monika T.', title:'Estetyczka', photoURL:'https://i.pravatar.cc/200?img=36' },
    ],
  };
  return map[bizId] || [
    { id:'st1', name:'Specjalista A', title:'Senior', photoURL:'https://i.pravatar.cc/200?img=40' },
    { id:'st2', name:'Specjalista B', title:'Junior', photoURL:'https://i.pravatar.cc/200?img=41' },
  ];
}

export function getMockAppointments() {
  return [
    { id:'ma1', serviceName:'Strzyżenie', businessName:'Barber Shop Pro', businessId:'1',
      date:'2026-05-20', time:'10:00', status:'confirmed', price:80 },
    { id:'ma2', serviceName:'Broda', businessName:'Barber Shop Pro', businessId:'1',
      date:'2026-05-25', time:'14:30', status:'pending', price:60 },
    { id:'ma3', serviceName:'Masaż relaksacyjny', businessName:'Zen Massage', businessId:'3',
      date:'2026-04-15', time:'11:00', status:'cancelled', price:180 },
    { id:'ma4', serviceName:'Lifting rzęs', businessName:'Lash & Brow Studio', businessId:'2',
      date:'2026-05-01', time:'09:00', status:'confirmed', price:180 },
  ];
}

export function getMockNotifications() {
  return [
    { id:'mn1', type:'booking', title:'Rezerwacja potwierdzona',
      message:'Twoja wizyta "Strzyżenie" 20 maja o 10:00 została potwierdzona.',
      read:false, createdAt:{ toDate:() => new Date() } },
    { id:'mn2', type:'general', title:'Nowe salony w Krakowie',
      message:'Sprawdź 3 nowe salony które dołączyły do Luminy.',
      read:false, createdAt:{ toDate:() => new Date(Date.now()-3600000) } },
    { id:'mn3', type:'booking', title:'Przypomnienie o wizycie',
      message:'Jutro o 14:30 masz wizytę "Broda" w Barber Shop Pro.',
      read:true, createdAt:{ toDate:() => new Date(Date.now()-86400000) } },
  ];
}

export function getMockFavoriteIds() {
  return ['1','3'];
}

export function getMockReviews() {
  return [
    { id:'r1', businessName:'Barber Shop Pro', businessId:'1', rating:5,
      comment:'Świetna obsługa, polecam każdemu. Marek robi cuda z nożyczkami!', date:'2026-05-01' },
    { id:'r2', businessName:'Zen Massage', businessId:'3', rating:4,
      comment:'Bardzo relaksujące, atmosfera idealna. Wrócę na pewno.', date:'2026-04-20' },
  ];
}

export function getMockAdminAppointments() {
  return [
    { id:'aa1', clientName:'Jan Kowalski', clientPhoto:'https://i.pravatar.cc/100?img=5',
      service:'Strzyżenie', staff:'Marek K.', date:'2026-05-13', time:'09:00', status:'pending', price:80 },
    { id:'aa2', clientName:'Piotr Nowak', clientPhoto:'https://i.pravatar.cc/100?img=6',
      service:'Strzyżenie + broda', staff:'Tomek W.', date:'2026-05-13', time:'10:30', status:'confirmed', price:120 },
    { id:'aa3', clientName:'Adam Wiśniewski', clientPhoto:'https://i.pravatar.cc/100?img=7',
      service:'Broda', staff:'Marek K.', date:'2026-05-13', time:'14:00', status:'pending', price:60 },
    { id:'aa4', clientName:'Marek Zając', clientPhoto:'https://i.pravatar.cc/100?img=8',
      service:'Stylizacja', staff:'Piotr D.', date:'2026-05-14', time:'11:00', status:'confirmed', price:50 },
    { id:'aa5', clientName:'Tomasz Krawczyk', clientPhoto:'https://i.pravatar.cc/100?img=9',
      service:'Strzyżenie', staff:'Tomek W.', date:'2026-05-14', time:'15:30', status:'pending', price:80 },
  ];
}
