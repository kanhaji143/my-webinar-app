export type Language = 'en' | 'hi';

export interface Translations {
  appName: string;
  tagline: string;
  webinarMode: string;
  meetingMode: string;
  dashboard: string;
  createWebinar: string;
  newMeeting: string;
  joinRoom: string;
  demoModeNotice: string;
  demoBadge: string;
  features: string;
  pricing: string;
  login: string;
  getStarted: string;
  explorePlatform: string;
  heroTitle: string;
  heroSubtitle: string;
  launchWebinar: string;
  startMeeting: string;
  allWebinars: string;
  scheduledWebinars: string;
  pastRecordings: string;
  noWebinarsTitle: string;
  noWebinarsDesc: string;
  title: string;
  description: string;
  hostName: string;
  hostNamePlaceholder: string;
  dateTime: string;
  duration: string;
  timezone: string;
  settingsHeading: string;
  recordSessionLabel: string;
  muteOnEntryLabel: string;
  allowQaLabel: string;
  saveDraft: string;
  scheduleWebinar: string;
  createSubmit: string;
  hostRoomTitle: string;
  viewerRoomTitle: string;
  meetingRoomTitle: string;
  mute: string;
  unmute: string;
  cameraOn: string;
  cameraOff: string;
  shareScreen: string;
  leaveRoom: string;
  endWebinar: string;
  startBroadcast: string;
  endBroadcast: string;
  publishDraft: string;
  participants: string;
  chat: string;
  qa: string;
  polls: string;
  send: string;
  registerNow: string;
  joinAsViewer: string;
  name: string;
  email: string;
  roleHost: string;
  roleViewer: string;
  roleParticipant: string;
  statusLive: string;
  statusUpcoming: string;
  statusEnded: string;
  statusDraft: string;
  statusScheduled: string;
  filterAll: string;
  searchPlaceholder: string;
  waitingForHost: string;
  waitingForHostSubtitle: string;
  stageActive: string;
  sessionConcluded: string;
  sessionConcludedSubtitle: string;
  registrationClosedDraft: string;
  registrationClosedEnded: string;
  footerRights: string;
}

export const translations: Record<Language, Translations> = {
  en: {
    appName: "WebinarPulse",
    tagline: "Professional Webinars & High-Def Video Meetings",
    webinarMode: "Webinars",
    meetingMode: "Meetings",
    dashboard: "Dashboard",
    createWebinar: "Host Webinar",
    newMeeting: "Quick Meeting",
    joinRoom: "Join Session",
    demoModeNotice: "DEMO MODE: Running fully local without external media servers or credentials.",
    demoBadge: "DEMO",
    features: "Features",
    pricing: "Roadmap",
    login: "Sign In",
    getStarted: "Get Started Free",
    explorePlatform: "Explore Dashboard",
    heroTitle: "Broadcast to Thousands, Meet with Anyone.",
    heroSubtitle: "An enterprise-grade hybrid live-streaming and interactive video meeting platform designed for seamless presentation delivery and high-touch team collaboration.",
    launchWebinar: "Create a Webinar",
    startMeeting: "Start Instant Meeting",
    allWebinars: "All Webinars",
    scheduledWebinars: "Upcoming Live Webinars",
    pastRecordings: "Recorded Archives",
    noWebinarsTitle: "No webinars found",
    noWebinarsDesc: "No webinars match the selected filter criteria or search query.",
    title: "Session Title",
    description: "Session Overview & Agenda",
    hostName: "Host / Presenter Name",
    hostNamePlaceholder: "e.g., Dr. Vikram Malhotra",
    dateTime: "Date & Start Time",
    duration: "Estimated Duration (Minutes)",
    timezone: "Broadcast Timezone",
    settingsHeading: "Webinar Preferences",
    recordSessionLabel: "Enable Cloud Recording (Demo)",
    muteOnEntryLabel: "Mute audience upon entry",
    allowQaLabel: "Enable Moderated Audience Q&A",
    saveDraft: "Save as Draft",
    scheduleWebinar: "Schedule Webinar",
    createSubmit: "Schedule Webinar Session",
    hostRoomTitle: "Host Broadcast Studio",
    viewerRoomTitle: "Live Webinar Stage",
    meetingRoomTitle: "Interactive Team Conference",
    mute: "Mute",
    unmute: "Unmute",
    cameraOn: "Camera On",
    cameraOff: "Camera Off",
    shareScreen: "Share Screen",
    leaveRoom: "Leave Room",
    endWebinar: "End Broadcast",
    startBroadcast: "Go Live (Start Broadcast)",
    endBroadcast: "End Broadcast Session",
    publishDraft: "Publish & Schedule",
    participants: "Participants",
    chat: "Live Chat",
    qa: "Q&A",
    polls: "Polls",
    send: "Send",
    registerNow: "Register for Session",
    joinAsViewer: "Enter Stage as Viewer",
    name: "Full Name",
    email: "Email Address",
    roleHost: "Host",
    roleViewer: "Viewer",
    roleParticipant: "Participant",
    statusLive: "LIVE",
    statusUpcoming: "UPCOMING",
    statusEnded: "ENDED",
    statusDraft: "DRAFT",
    statusScheduled: "SCHEDULED",
    filterAll: "All",
    searchPlaceholder: "Search webinars by title or presenter...",
    waitingForHost: "Webinar Stage Standby",
    waitingForHostSubtitle: "The host has not started broadcasting yet. The live stream will appear here when the event begins.",
    stageActive: "Live Broadcast Active",
    sessionConcluded: "Webinar Has Ended",
    sessionConcludedSubtitle: "This broadcast session has concluded. Replays will be made available shortly.",
    registrationClosedDraft: "This webinar is currently in Draft mode and is not yet open for public audience registration.",
    registrationClosedEnded: "Registration is closed because this live session has already concluded.",
    footerRights: "All rights reserved. Option C Dual-Mode Architecture."
  },
  hi: {
    appName: "वेबिनारपल्स",
    tagline: "पेशेवर वेबिनार और उच्च गुणवत्ता वाली वीडियो बैठकें",
    webinarMode: "वेबिनार",
    meetingMode: "मीटिंग",
    dashboard: "डैशबोर्ड",
    createWebinar: "वेबिनार आयोजित करें",
    newMeeting: "त्वरित मीटिंग",
    joinRoom: "सत्र से जुड़ें",
    demoModeNotice: "डेमो मोड: बिना किसी बाहरी मीडिया सर्वर या क्रेडेंशियल्स के स्थानीय रूप से चल रहा है।",
    demoBadge: "डेमो",
    features: "विशेषताएं",
    pricing: "रोडमैप",
    login: "साइन इन",
    getStarted: "शुरू करें",
    explorePlatform: "डैशबोर्ड देखें",
    heroTitle: "हज़ारों लोगों तक प्रसारण करें, किसी से भी मिलें।",
    heroSubtitle: "सुगम प्रस्तुति और सहज टीम सहयोग के लिए डिज़ाइन किया गया एक एंटरप्राइज-ग्रेड लाइव-स्ट्रीमिंग और इंटरैक्टिव वीडियो प्लेटफॉर्म।",
    launchWebinar: "वेबिनार बनाएं",
    startMeeting: "तुरंत मीटिंग शुरू करें",
    allWebinars: "सभी वेबिनार",
    scheduledWebinars: "आगामी लाइव वेबिनार",
    pastRecordings: "रिकॉर्डेड आर्काइव",
    noWebinarsTitle: "कोई वेबिनार नहीं मिला",
    noWebinarsDesc: "चयनित फ़िल्टर या खोज क्वेरी से मेल खाने वाला कोई वेबिनार नहीं मिला।",
    title: "सत्र का शीर्षक",
    description: "सत्र विवरण और एजेंडा",
    hostName: "होस्ट / प्रस्तोता का नाम",
    hostNamePlaceholder: "उदा., डॉ. विक्रम मल्होत्रा",
    dateTime: "दिनांक और समय",
    duration: "अनुमानित अवधि (मिनट)",
    timezone: "प्रसारण समय क्षेत्र",
    settingsHeading: "वेबिनार सेटिंग्स",
    recordSessionLabel: "क्लाउड रिकॉर्डिंग सक्षम करें (डेमो)",
    muteOnEntryLabel: "प्रवेश पर दर्शकों को म्यूट करें",
    allowQaLabel: "प्रश्नोत्तरी (Q&A) सक्षम करें",
    saveDraft: "ड्राफ्ट के रूप में सहेजें",
    scheduleWebinar: "वेबिनार शेड्यूल करें",
    createSubmit: "वेबिनार सत्र निर्धारित करें",
    hostRoomTitle: "होस्ट ब्रॉडकास्ट स्टूडियो",
    viewerRoomTitle: "लाइव वेबिनार स्टेज",
    meetingRoomTitle: "इंटरैक्टिव टीम कॉन्फ्रेंस",
    mute: "म्यूट करें",
    unmute: "अनम्यूट करें",
    cameraOn: "कैमरा चालू",
    cameraOff: "कैमरा बंद",
    shareScreen: "स्क्रीन शेयर",
    leaveRoom: "रूम छोड़ें",
    endWebinar: "प्रसारण समाप्त करें",
    startBroadcast: "लाइव जाएं (प्रसारण शुरू करें)",
    endBroadcast: "प्रसारण सत्र समाप्त करें",
    publishDraft: "प्रकाशित और शेड्यूल करें",
    participants: "प्रतिभागी",
    chat: "लाइव चैट",
    qa: "प्रश्नोत्तरी (Q&A)",
    polls: "पोल",
    send: "भेजें",
    registerNow: "सत्र के लिए पंजीकरण करें",
    joinAsViewer: "दर्शक के रूप में प्रवेश करें",
    name: "पूरा नाम",
    email: "ईमेल पता",
    roleHost: "होस्ट",
    roleViewer: "दर्शक",
    roleParticipant: "प्रतिभागी",
    statusLive: "लाइव",
    statusUpcoming: "आगामी",
    statusEnded: "समाप्त",
    statusDraft: "ड्राफ्ट",
    statusScheduled: "शेड्यूल्ड",
    filterAll: "सभी",
    searchPlaceholder: "शीर्षक या प्रस्तोता द्वारा वेबिनार खोजें...",
    waitingForHost: "वेबिनार स्टेज स्टैंडबाय",
    waitingForHostSubtitle: "होस्ट ने अभी प्रसारण शुरू नहीं किया है। लाइव स्ट्रीम कार्यक्रम शुरू होने पर यहाँ दिखाई देगी।",
    stageActive: "लाइव प्रसारण सक्रिय",
    sessionConcluded: "वेबिनार समाप्त हो गया है",
    sessionConcludedSubtitle: "यह प्रसारण सत्र समाप्त हो चुका है। रिकॉर्डिंग जल्द उपलब्ध कराई जाएगी।",
    registrationClosedDraft: "यह वेबिनार अभी ड्राफ्ट मोड में है और सार्वजनिक पंजीकरण के लिए नहीं खुला है।",
    registrationClosedEnded: "पंजीकरण बंद है क्योंकि यह लाइव सत्र पहले ही समाप्त हो चुका है।",
    footerRights: "सर्वाधिकार सुरक्षित। विकल्प सी ड्यूल-मोड आर्किटेक्चर।"
  }
};
