import {env} from "@/common/utils/envConfig";
import {logger} from "@/server";

export interface ServiceM8CompanyData {
    name: string;
    uuid: string;
}

export interface ServiceM8Response {
    "errorCode": string;
    "message": string;
}

export interface ServiceM8JobData {
    status: string;
    date: string;
    company_uuid: string;
}

export class ServiceM8Service {
    private readonly apiKey: string;
    private baseUrl: string = "https://api.servicem8.com/api_1.0";

    constructor(apiKey?: string) {
        this.apiKey = apiKey || env.SERVICEM8_API_KEY;
    }

    /**
     * Create a company in ServiceM8
     * @param data - Company data (name is required)
     * @returns Promise with the created company response
     */
    async createClient(data: ServiceM8CompanyData): Promise<ServiceM8Response | null> {
        try {
            const options = {
                method: "POST",
                headers: {
                    accept: "application/json",
                    "content-type": "application/json",
                    "X-Api-Key": this.apiKey,
                },
                body: JSON.stringify({
                    name: data.name,
                    uuid: data.uuid
                }),
            };

            const response = await fetch(`${this.baseUrl}/company.json`, options);

            if (!response.ok) {
                const errorText = await response.text();
                logger.error(`ServiceM8 API error: ${response.status} - ${errorText}`);
                return null;
            }

            return await response.json() as ServiceM8Response;
        } catch (error) {
            logger.error(`Error creating ServiceM8 company: ${(error as Error).message}`);
            return null;
        }
    }

    /**
     * Create a job in ServiceM8
     * @param data - Job data (status, date, and company_uuid are required)
     * @returns Promise with the created job response
     */
    async createJob(data: ServiceM8JobData): Promise<ServiceM8Response | null> {
        try {
            const options = {
                method: "POST",
                headers: {
                    accept: "application/json",
                    "content-type": "application/json",
                    "X-Api-Key": this.apiKey,
                },
                body: JSON.stringify({
                    status: data.status,
                    date: data.date,
                    company_uuid: data.company_uuid,
                }),
            };

            const response = await fetch(`${this.baseUrl}/job.json`, options);

            if (!response.ok) {
                const errorText = await response.text();
                logger.error(`ServiceM8 API error: ${response.status} - ${errorText}`);
                return null;
            }


            return await response.json() as ServiceM8Response;
        } catch (error) {
            logger.error(`Error creating ServiceM8 job: ${(error as Error).message}`);
            return null;
        }
    }
}

export const serviceM8Service = new ServiceM8Service();

