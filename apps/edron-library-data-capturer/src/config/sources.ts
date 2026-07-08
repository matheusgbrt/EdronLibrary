export interface WikiSourceConfig {
  key: 'tibiafandom';
  apiUrl: string;
  pageBaseUrl: string;
  userAgent: string;
}

export const TIBIA_FANDOM_SOURCE: WikiSourceConfig = {
  key: 'tibiafandom',
  apiUrl: 'https://tibia.fandom.com/api.php',
  pageBaseUrl: 'https://tibia.fandom.com/wiki/',
  userAgent: 'EdronLibraryDataCapturer/0.1 contact: local-development',
};

export const DOWNLOAD_IMAGES = true;
export const REQUEST_CONCURRENCY = 4;
