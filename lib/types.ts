export type CheckResponse = ApiRawResponse;

export interface CheckResult {
  tk: string;
  mk: string;
  status: "live" | "die" | "error";
  uid?: number;
  username?: string;
  aov_name?: string;
  aov_rank?: string;
  aov_level?: number;
  aov_banned?: string;
  aov_total_skins?: number;
  aov_total_champs?: number;
  aov_ss?: number;
  aov_ss_list?: string[];
  aov_sss?: number;
  aov_sss_list?: string[];
  aov_anime?: number;
  aov_anime_list?: string[];
  region?: string;
  shells?: number;
  email_verified?: boolean;
  mobile_bound?: boolean;
  fb_linked?: boolean;
  garena_created?: string;
  last_login?: string;
  last_session_country?: string;
  raw?: unknown;
}

export interface ApiRawResponse {
  status: string;
  tk: string;
  mk: string;
  uid?: number;
  username?: string;
  nickname?: string;
  region?: string;
  shells?: number;
  email_verified?: boolean;
  mobile_bound?: boolean;
  fb_linked?: boolean;
  account_secured?: boolean;
  password_set?: boolean;
  aov_name?: string;
  aov_rank?: string;
  aov_level?: number;
  aov_banned?: string;
  aov_total_skins?: number;
  aov_total_champs?: number;
  aov_ss?: number;
  aov_ss_list?: string[];
  aov_sss?: number;
  aov_sss_list?: string[];
  aov_anime?: number;
  aov_anime_list?: string[];
  fc_name?: string;
  fc_level?: number;
  garena_created?: string;
  last_login?: string;
  last_session_ip?: string;
  last_session_country?: string;
  error?: string;
  details?: string;
}
