export enum Protocols {
  UNKNOWN = -1,
  UNUSED,
  RC5,
  RC6,
  NEC,
  SONY,
  PANASONIC,  // (5)
  JVC,
  SAMSUNG,
  WHYNTER,
  AIWA_RC_T501,
  LG,  // (10)
  SANYO,
  MITSUBISHI,
  DISH,
  SHARP,
  COOLIX,  // (15)
  DAIKIN,
  DENON,
  KELVINATOR,
  SHERWOOD,
  MITSUBISHI_AC,  // (20)
  RCMM,
  SANYO_LC7461,
  RC5X,
  GREE,
  PRONTO,  // Technically not a protocol, but an encoding. (25)
  NEC_LIKE,
  ARGO,
  TROTEC,
  NIKAI,
  RAW,  // Technically not a protocol, but an encoding. (30)
  GLOBALCACHE,  // Technically not a protocol, but an encoding.
  TOSHIBA_AC,
  FUJITSU_AC,
  MIDEA,
  MAGIQUEST,  // (35)
  LASERTAG,
  CARRIER_AC,
  HAIER_AC,
  MITSUBISHI2,
  HITACHI_AC,  // (40)
  HITACHI_AC1,
  HITACHI_AC2,
  GICABLE,
  HAIER_AC_YRW02,
  WHIRLPOOL_AC,  // (45)
  SAMSUNG_AC,
  LUTRON,
  ELECTRA_AC,
  PANASONIC_AC,
  PIONEER,  // (50)
  LG2,
  MWM,
  DAIKIN2,
  VESTEL_AC,
  TECO,  // (55)
  SAMSUNG36,
  TCL112AC,
  LEGOPF,
  MITSUBISHI_HEAVY_88,
  MITSUBISHI_HEAVY_152,  // 60
  DAIKIN216,
  SHARP_AC,
  GOODWEATHER,
  INAX,
  DAIKIN160,  // 65
  NEOCLIMA,
  DAIKIN176,
  DAIKIN128,
  AMCOR,
  DAIKIN152,  // 70
  MITSUBISHI136,
  MITSUBISHI112,
  HITACHI_AC424,
  SONY_38K,
  EPSON,  // 75
  SYMPHONY,
  HITACHI_AC3,
  DAIKIN64,
  AIRWELL,
  DELONGHI_AC,  // 80
  DOSHISHA,
  MULTIBRACKETS,
  CARRIER_AC40,
  CARRIER_AC64,
  HITACHI_AC344,  // 85
  CORONA_AC,
  MIDEA24,
  ZEPEAL,
  SANYO_AC,
  VOLTAS,  // 90
  METZ,
  TRANSCOLD,
  TECHNIBEL_AC,
  MIRAGE,
  ELITESCREENS,  // 95
  PANASONIC_AC32,
  MILESTAG2,
  ECOCLIM,
  XMP,
  TRUMA,  // 100
  HAIER_AC176,
  TEKNOPOINT,
  KELON,
  TROTEC_3550,
  SANYO_AC88,  // 105
  BOSE,
  ARRIS,
  RHOSS,
  AIRTON,
  COOLIX48,  // 110
  HITACHI_AC264,
}

export enum ModeStatus {
  WALL,
  TRANSPARENT,
  UNKNOWN
}

export enum PowerStatus {
  ON,
  OFF,
  UNKNOWN
}

export enum NetworkStatus {
  ONLINE,
  OFFLINE,
  OFF,
  UNKNOWN
}

export enum IRStatus {
  IDLE,
  BUSY,
  PAUSED,
  UNKNOWN
}

export enum CommandType {
  TX_PAUSE,
  TX_RESUME,
  TX_STOP,
  RECONFIGURE,
}

export type Command = {
  type: CommandType;
}

export enum EventType {
  EVENT_SIGNAL,
  EVENT_SLEEP
}

export type EventSignal = {
  type: EventType.EVENT_SIGNAL;
  protocol: number;
  code: string;
  nbits: number;
}

export type EventSleep = {
  type: EventType.EVENT_SLEEP;
  ms: number;
}

export type BlasterStatus = {
  mode: ModeStatus;
  power: PowerStatus;
  network: NetworkStatus;
  ir: IRStatus;
}

export enum BlasterTopics {
  INPUT = 'topic-input',
  OUTPUT = 'topic-output',
  GET = 'topic-get',
  SET = 'topic-set',
  MAIN = 'main',
  CONTROL = 'topic-control',
  DISCONNECT = 'topic-disconnect'
}

export type FriendlyName = string;

export type LocalTopics<FriendlyName> = {
  [BlasterTopics.INPUT]: string;
  [BlasterTopics.OUTPUT]: string;
  [BlasterTopics.GET]: string;
  [BlasterTopics.SET]: string;
  [BlasterTopics.MAIN]: string;
  [BlasterTopics.CONTROL]: string;
  [BlasterTopics.DISCONNECT]: string;
}
