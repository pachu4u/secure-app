export interface XsuaaCredentials {
  apiurl: string;
  clientid: string;
  clientsecret: string;
  identityzone: string;
  identityzoneid: string;
  sburl: string;
  tenantid: string;
  tenantmode: string;
  uaadomain: string;
  url: string;
  verificationkey: string;
  xsappname: string;
  [key: string]: string;
}

export interface XsuaaService {
  label: string;
  credentials: XsuaaCredentials;
  name?: string;
  plan?: string;
  tags?: string[];
}

export interface ServiceBindings {
  [key: string]: XsuaaService[];
}

type ServiceFilters = Record<string, { label: string }>;

export function getServices<T extends ServiceFilters>(
  filters: T
): { [K in keyof T]: XsuaaService } {
  try {
    // For local development, return mock services
    if (process.env.NODE_ENV === 'development') {
      return {
        xsuaa: {
          label: 'xsuaa',
          credentials: {
            apiurl: process.env.XSUAA_API_URL || '',
            clientid: process.env.XSUAA_CLIENT_ID || '',
            clientsecret: process.env.XSUAA_CLIENT_SECRET || '',
            identityzone: process.env.XSUAA_IDENTITY_ZONE || '',
            identityzoneid: process.env.XSUAA_IDENTITY_ZONEID || '',
            sburl: process.env.NEXT_PUBLIC_SAP_BTP_URL || '',
            tenantid: process.env.XSUAA_TENANT_ID || '',
            tenantmode: 'dedicated',
            uaadomain: process.env.XSUAA_UAA_DOMAIN || '',
            url: process.env.NEXT_PUBLIC_SAP_BTP_URL || '',
            verificationkey: process.env.XSUAA_VERIFICATION_KEY || '',
            xsappname: process.env.XSUAA_XSAPPNAME || '',
          }
        }
      } as { [K in keyof T]: XsuaaService };
    }

    // For production, get services from VCAP_SERVICES
    const vcapServices: ServiceBindings = process.env.VCAP_SERVICES 
      ? JSON.parse(process.env.VCAP_SERVICES)
      : {};

    const services: Partial<Record<keyof T, XsuaaService>> = {};
    
    for (const [key, filter] of Object.entries(filters)) {
      const serviceArray = vcapServices[filter.label];
      if (!serviceArray || serviceArray.length === 0) {
        throw new Error(`Service ${filter.label} not found in VCAP_SERVICES`);
      }
      services[key as keyof T] = serviceArray[0];
    }

    return services as { [K in keyof T]: XsuaaService };
  } catch (error) {
    console.error('Error getting services:', error);
    throw error;
  }
} 