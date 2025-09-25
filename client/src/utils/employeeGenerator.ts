// Employee Data Generator - Realistic German employee data
export interface GeneratedEmployee {
  firstname: string;
  lastname: string;
  title: string;
  email: string;
  phone: string;
  orgeh: string;
  job: string;
  plans: string;
  location: string;
  begda: string;
  endda: string;
  contract_type: string;
  workschedule: string;
  birthdate: string;
  gender: string;
  natio: string;
  persg: string;
  persk: string;
}

// German first names
const germanFirstNames = {
  male: [
    'Alexander', 'Andreas', 'Christian', 'Daniel', 'David', 'Dennis', 'Florian',
    'Frank', 'Jan', 'Johannes', 'Klaus', 'Lars', 'Markus', 'Martin', 'Michael',
    'Oliver', 'Patrick', 'Peter', 'Stefan', 'Thomas', 'Tobias', 'Wolfgang',
    'Bernd', 'Dieter', 'Gerhard', 'Günter', 'Hans', 'Heinz', 'Hermann', 'Joachim',
    'Jörg', 'Jürgen', 'Karl', 'Manfred', 'Norbert', 'Rainer', 'Reinhard', 'Rolf',
    'Uwe', 'Volker', 'Werner', 'Wilfried', 'Sebastian', 'Matthias', 'Benjamin'
  ],
  female: [
    'Andrea', 'Angela', 'Anna', 'Birgit', 'Brigitte', 'Christa', 'Christine',
    'Claudia', 'Doris', 'Elisabeth', 'Gabi', 'Heike', 'Ingrid', 'Julia', 'Karin',
    'Katrin', 'Maria', 'Martina', 'Monika', 'Petra', 'Regina', 'Renate', 'Sabine',
    'Sandra', 'Silke', 'Susanne', 'Ute', 'Ursula', 'Eva', 'Helga', 'Inge',
    'Margarete', 'Marie', 'Marianne', 'Nicole', 'Rita', 'Rosemarie', 'Ruth',
    'Stefanie', 'Tanja', 'Vera', 'Waltraud', 'Gudrun', 'Hannelore'
  ]
};

// German surnames
const germanSurnames = [
  'Müller', 'Schmidt', 'Schneider', 'Fischer', 'Weber', 'Meyer', 'Wagner', 'Becker',
  'Schulz', 'Hoffmann', 'Schäfer', 'Koch', 'Bauer', 'Richter', 'Klein', 'Wolf',
  'Schröder', 'Neumann', 'Schwarz', 'Zimmermann', 'Braun', 'Krüger', 'Hofmann',
  'Hartmann', 'Lange', 'Schmitt', 'Werner', 'Schmitz', 'Krause', 'Meier', 'Lehmann',
  'Fuchs', 'Kaiser', 'Huber', 'Mayer', 'Hermann', 'König', 'Walter', 'Peters',
  'Schulze', 'Heinrich', 'Weiß', 'Sommer', 'Jung', 'Möller', 'Hahn', 'Vogel',
  'Friedrich', 'Keller', 'Günther', 'Frank', 'Berger', 'Winkler', 'Roth', 'Beck',
  'Lorenz', 'Baumann', 'Franke', 'Albrecht', 'Ludwig', 'Winter', 'Kraus', 'Martin',
  'Schumacher', 'Krämer', 'Vogt', 'Stein', 'Jäger', 'Otto', 'Sommer', 'Groß',
  'Seidel', 'Heinrich', 'Brandt', 'Haas', 'Schreiber', 'Graf', 'Schulte', 'Dietrich'
];

// Academic titles with weights (probability)
const academicTitles = [
  { value: '', weight: 60 },
  { value: 'Dr.', weight: 25 },
  { value: 'Prof. Dr.', weight: 10 },
  { value: 'PD Dr.', weight: 4 },
  { value: 'Dipl.-Ing.', weight: 1 }
];

// Job titles for German university
const jobTitles = [
  'Bibliothekar',
  'IT-Administrator',
  'Professor',
  'Wissenschaftlicher Mitarbeiter',
  'Tutor',
  'Sachbearbeiter',
  'Sekretariat',
  'Hausmeister',
  'Laborassistent',
  'Projektleiter',
  'Systemadministrator',
  'Forschungsassistent',
  'Studienberater',
  'Verwaltungsangestellter',
  'Techniker',
  'Dozent',
  'Post-Doc',
  'Dekan',
  'Prorektor',
  'Kanzler'
];

// Locations
const locations = [
  'Campus West',
  'Campus Ost',
  'Campus Nord',
  'Campus Süd',
  'Campus Mitte'
];

// Employee groups with job correlations
const employeeGroups = {
  'Professor': 'Professoren',
  'Dozent': 'Professoren',
  'Dekan': 'Professoren',
  'Prorektor': 'Professoren',
  'Post-Doc': 'Professoren',
  'Wissenschaftlicher Mitarbeiter': 'Angestellte',
  'Forschungsassistent': 'Angestellte',
  'IT-Administrator': 'Angestellte',
  'Projektleiter': 'Angestellte',
  'Systemadministrator': 'Angestellte',
  'Sachbearbeiter': 'Angestellte',
  'Verwaltungsangestellter': 'Angestellte',
  'Studienberater': 'Angestellte',
  'Sekretariat': 'Angestellte',
  'Bibliothekar': 'Angestellte',
  'Techniker': 'Angestellte',
  'Kanzler': 'Führungskräfte',
  'Tutor': 'Hilfskräfte',
  'Laborassistent': 'Hilfskräfte',
  'Hausmeister': 'Beamte'
};

// Contract types with job correlations
const contractTypes = {
  'Professor': 'unbefristet',
  'Dozent': 'unbefristet',
  'Dekan': 'unbefristet',
  'Prorektor': 'unbefristet',
  'Kanzler': 'unbefristet',
  'IT-Administrator': 'unbefristet',
  'Sachbearbeiter': 'unbefristet',
  'Verwaltungsangestellter': 'unbefristet',
  'Sekretariat': 'unbefristet',
  'Bibliothekar': 'unbefristet',
  'Techniker': 'unbefristet',
  'Hausmeister': 'unbefristet',
  'Wissenschaftlicher Mitarbeiter': 'befristet',
  'Post-Doc': 'befristet',
  'Forschungsassistent': 'befristet',
  'Projektleiter': 'befristet',
  'Systemadministrator': 'befristet',
  'Studienberater': 'befristet',
  'Tutor': 'Werkstudent',
  'Laborassistent': 'befristet'
};

// Work schedules
const workSchedules = {
  'Professor': 'Vollzeit',
  'Dozent': 'Vollzeit',
  'Dekan': 'Vollzeit',
  'Prorektor': 'Vollzeit',
  'Kanzler': 'Vollzeit',
  'IT-Administrator': 'Vollzeit',
  'Sachbearbeiter': 'Vollzeit',
  'Verwaltungsangestellter': 'Vollzeit',
  'Sekretariat': 'Vollzeit',
  'Bibliothekar': 'Vollzeit',
  'Techniker': 'Vollzeit',
  'Hausmeister': 'Vollzeit',
  'Wissenschaftlicher Mitarbeiter': 'Vollzeit',
  'Post-Doc': 'Vollzeit',
  'Forschungsassistent': 'Teilzeit',
  'Projektleiter': 'Vollzeit',
  'Systemadministrator': 'Vollzeit',
  'Studienberater': 'Teilzeit',
  'Tutor': 'Teilzeit',
  'Laborassistent': 'Teilzeit'
};

// Utility functions
const randomChoice = <T>(array: T[]): T => {
  return array[Math.floor(Math.random() * array.length)];
};

const weightedChoice = <T extends { value: any; weight: number }>(items: T[]): T['value'] => {
  const totalWeight = items.reduce((sum, item) => sum + item.weight, 0);
  let random = Math.random() * totalWeight;

  for (const item of items) {
    random -= item.weight;
    if (random <= 0) {
      return item.value;
    }
  }
  return items[0].value;
};

const generateGermanDate = (startYear: number, endYear: number): string => {
  const start = new Date(startYear, 0, 1);
  const end = new Date(endYear, 11, 31);
  const randomTime = start.getTime() + Math.random() * (end.getTime() - start.getTime());
  const randomDate = new Date(randomTime);

  const day = randomDate.getDate().toString().padStart(2, '0');
  const month = (randomDate.getMonth() + 1).toString().padStart(2, '0');
  const year = randomDate.getFullYear();

  return `${day}.${month}.${year}`;
};

const generatePhoneNumber = (): string => {
  const prefixes = ['+49 30', '+49 40', '+49 89', '030', '040', '089', '0221', '0211'];
  const prefix = randomChoice(prefixes);
  const number = Math.floor(Math.random() * 90000000 + 10000000).toString();
  return `${prefix} ${number.substring(0, 4)} ${number.substring(4)}`;
};

const generateEmail = (firstname: string, lastname: string): string => {
  const domains = ['@hochschule.de', '@uni.de', '@campus.de'];
  const firstPart = firstname.toLowerCase().replace(/[äöüß]/g, (match) => {
    const replacements: { [key: string]: string } = { 'ä': 'ae', 'ö': 'oe', 'ü': 'ue', 'ß': 'ss' };
    return replacements[match] || match;
  });
  const lastPart = lastname.toLowerCase().replace(/[äöüß]/g, (match) => {
    const replacements: { [key: string]: string } = { 'ä': 'ae', 'ö': 'oe', 'ü': 'ue', 'ß': 'ss' };
    return replacements[match] || match;
  });

  const domain = randomChoice(domains);
  const separator = randomChoice(['.', '-', '_']);

  return `${firstPart}${separator}${lastPart}${domain}`;
};

const generatePositionId = (): string => {
  const prefix = 'PL';
  const number = Math.floor(Math.random() * 9000 + 1000);
  return `${prefix}${number}`;
};

export const generateRealisticEmployee = (availableOrganizations: Array<{objid: string, stext: string}>): GeneratedEmployee => {
  // Determine gender first
  const gender = randomChoice(['M', 'F', 'D']);
  const genderForNames = gender === 'D' ? randomChoice(['male', 'female']) : (gender === 'M' ? 'male' : 'female');

  // Generate names
  const firstname = randomChoice(germanFirstNames[genderForNames as keyof typeof germanFirstNames]);
  const lastname = randomChoice(germanSurnames);

  // Generate title (academic titles more likely for certain jobs)
  const title = weightedChoice(academicTitles);

  // Select job and derive related fields
  const job = randomChoice(jobTitles);
  const persg = employeeGroups[job as keyof typeof employeeGroups] || 'Angestellte';
  const contract_type = contractTypes[job as keyof typeof contractTypes] || 'unbefristet';
  const workschedule = workSchedules[job as keyof typeof workSchedules] || 'Vollzeit';

  // Generate other fields
  const location = randomChoice(locations);
  const orgeh = availableOrganizations.length > 0
    ? randomChoice(availableOrganizations).objid
    : '1001'; // fallback

  // Generate dates
  const birthdate = generateGermanDate(1960, 2000);
  const begda = generateGermanDate(2020, 2024);

  // End date logic based on contract type
  let endda: string;
  if (contract_type === 'unbefristet') {
    endda = '31.12.2099';
  } else if (contract_type === 'Werkstudent') {
    endda = generateGermanDate(2024, 2026);
  } else {
    endda = generateGermanDate(2025, 2027);
  }

  // Generate contact information
  const email = generateEmail(firstname, lastname);
  const phone = generatePhoneNumber();

  // Generate position ID
  const plans = generatePositionId();

  // Employee subgroup (Personaluntergruppe)
  let persk: string;
  if (persg === 'Professoren') {
    persk = 'Wissenschaftlich';
  } else if (persg === 'Hilfskräfte') {
    persk = job.includes('Tutor') ? 'Wissenschaftlich' : 'Nicht-Wissenschaftlich';
  } else {
    persk = randomChoice(['Vollzeit', 'Teilzeit']);
  }

  return {
    firstname,
    lastname,
    title,
    email,
    phone,
    orgeh,
    job,
    plans,
    location,
    begda,
    endda,
    contract_type,
    workschedule,
    birthdate,
    gender,
    natio: 'DE',
    persg,
    persk
  };
};