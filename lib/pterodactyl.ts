import axios, { AxiosInstance } from 'axios';

interface CreateUserData {
    email: string;
    username: string;
    firstName: string;
    lastName: string;
    password?: string;
}

export interface PterodactylUserResponse {
    object: 'user';
    attributes: {
        id: number;
        uuid: string;
        username: string;
        email: string;
        first_name: string;
        last_name: string;
        language: string;
        root_admin: boolean;
    };
}

export interface PterodactylServerAttributes {
    id: number;
    uuid: string;
    identifier: string;
    name: string;
    description: string;
    status: string | null;
    suspended: boolean;
    limits: {
        memory: number;
        swap: number;
        disk: number;
        io: number;
        cpu: number;
        threads: string | null;
    };
    feature_limits: {
        databases: number;
        allocations: number;
        backups: number;
    };
    user: number;
    node: number;
    allocation: number;
    nest: number;
    egg: number;
    pack: number | null;
    container: {
        startup_command: string;
        image: string;
        installed: boolean;
        environment: Record<string, any>;
    };
    created_at: string;
    updated_at: string;
}

export interface PterodactylServersResponse {
    object: 'list';
    data: {
        object: 'server';
        attributes: PterodactylServerAttributes;
    }[];
    meta: {
        pagination: {
            total: number;
            count: number;
            per_page: number;
            current_page: number;
            total_pages: number;
        };
    };
}

export interface PterodactylNodeAttributes {
    id: number;
    name: string;
    description: string;
    location_id: number;
    fqdn: string;
    scheme: string;
    behind_proxy: boolean;
    maintenance_mode: boolean;
    memory: number;
    memory_overallocate: number;
    disk: number;
    disk_overallocate: number;
    upload_size: number;
    daemon_listen: number;
    daemon_sftp: number;
}

export interface PterodactylNestAttributes {
    id: number;
    uuid: string;
    author: string;
    name: string;
    description: string;
    created_at: string;
    updated_at: string;
}

export interface PterodactylEggAttributes {
    id: number;
    uuid: string;
    name: string;
    nest: number;
    author: string;
    description: string;
    docker_image: string;
    startup: string;
}

export interface PterodactylEggVariable {
    id: number;
    name: string;
    description: string;
    env_variable: string;
    default_value: string;
    user_viewable: boolean;
    user_editable: boolean;
    rules: string;
}

export interface PterodactylAllocationAttributes {
    id: number;
    ip: string;
    alias: string | null;
    port: number;
    notes: string | null;
    assigned: boolean;
}

class PterodactylService {
    private client: AxiosInstance;

    constructor() {
        const baseURL = process.env.PTERODACTYL_API_URL;
        const apiKey = process.env.PTERODACTYL_API_KEY;

        if (!baseURL || !apiKey) {
            throw new Error('Pterodactyl API configuration missing');
        }

        this.client = axios.create({
            baseURL,
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json',
                'Accept': 'application/json',
            },
        });
    }

    async getUsers(page: number = 1): Promise<{ data: PterodactylUserResponse['attributes'][], meta: any }> {
        try {
            const response = await this.client.get<{ data: { attributes: PterodactylUserResponse['attributes'] }[], meta: any }>(`/application/users?page=${page}&per_page=50`);
            return {
                data: response.data.data.map(d => d.attributes),
                meta: response.data.meta
            };
        } catch (error: any) {
            console.error('Pterodactyl Get Users Error:', error.response?.data || error.message);
            return { data: [], meta: null };
        }
    }

    async createUser(data: CreateUserData): Promise<PterodactylUserResponse['attributes']> {
        try {
            const payload = {
                email: data.email,
                username: data.username,
                first_name: data.firstName,
                last_name: data.lastName,
                password: data.password,
            };

            const response = await this.client.post<PterodactylUserResponse>('/application/users', payload);
            return response.data.attributes;
        } catch (error: any) {
            console.error('Pterodactyl Create User Error:', error.response?.data || error.message);
            if (error.response?.data?.errors) {
                throw new Error(error.response.data.errors.map((e: any) => e.detail).join(', '));
            }
            throw new Error('Failed to create user on Pterodactyl');
        }
    }

    async updateUser(id: number, data: Partial<CreateUserData>): Promise<PterodactylUserResponse['attributes']> {
        try {
            const payload: any = {
                email: data.email,
                username: data.username,
                first_name: data.firstName,
                last_name: data.lastName,
            };

            if (data.password) {
                payload.password = data.password;
            }

            Object.keys(payload).forEach(key => payload[key] === undefined && delete payload[key]);

            const response = await this.client.patch<PterodactylUserResponse>(`/application/users/${id}`, payload);
            return response.data.attributes;
        } catch (error: any) {
            console.error('Pterodactyl Update User Error:', error.response?.data || error.message);
            if (error.response?.data?.errors) {
                throw new Error(error.response.data.errors.map((e: any) => e.detail).join(', '));
            }
            throw new Error('Failed to update user on Pterodactyl');
        }
    }

    async deleteUser(id: number): Promise<void> {
        try {
            await this.client.delete(`/application/users/${id}`);
        } catch (error: any) {
            console.error('Pterodactyl Delete User Error:', error.response?.data || error.message);
            throw new Error('Failed to delete user from Pterodactyl');
        }
    }

    async getUserByEmail(email: string): Promise<PterodactylUserResponse['attributes'] | null> {
        try {
            const response = await this.client.get<{ object: string, data: { object: string, attributes: PterodactylUserResponse['attributes'] }[] }>(`/application/users?filter[email]=${encodeURIComponent(email)}`);
            if (response.data.data.length > 0) {
                return response.data.data[0].attributes;
            }
            return null;
        } catch (error: any) {
            console.error('Pterodactyl Get User Error:', error.response?.data || error.message);
            return null;
        }
    }

    async getServersByUserId(userId: number): Promise<PterodactylServerAttributes[]> {
        try {
            // Some Pterodactyl versions don't allow filter[user_id] in Application API.
            // We'll fetch all and filter manually to be safe.
            const response = await this.client.get<PterodactylServersResponse>('/application/servers');
            return response.data.data
                .map(d => d.attributes)
                .filter(s => s.user === userId);
        } catch (error: any) {
            console.error('Pterodactyl Get Servers Error:', error.response?.data || error.message);
            if (error.response?.data?.errors) {
                throw new Error(error.response.data.errors.map((e: any) => e.detail).join(', '));
            }
            throw new Error('Failed to fetch servers from Pterodactyl');
        }
    }

    async getAllServers(page: number = 1): Promise<{ data: PterodactylServerAttributes[], meta: any }> {
        try {
            const response = await this.client.get<PterodactylServersResponse>(`/application/servers?page=${page}&per_page=50`);
            return {
                data: response.data.data.map(d => d.attributes),
                meta: response.data.meta
            };
        } catch (error: any) {
            console.error('Pterodactyl Get All Servers Error:', error.response?.data || error.message);
            return { data: [], meta: null };
        }
    }

    async getNodes(): Promise<PterodactylNodeAttributes[]> {
        try {
            const response = await this.client.get<{ data: { attributes: PterodactylNodeAttributes }[] }>('/application/nodes');
            return response.data.data.map(d => d.attributes);
        } catch (error: any) {
            console.error('Pterodactyl Get Nodes Error:', error.response?.data || error.message);
            return [];
        }
    }

    async getNests(): Promise<PterodactylNestAttributes[]> {
        try {
            const response = await this.client.get<{ data: { attributes: PterodactylNestAttributes }[] }>('/application/nests');
            return response.data.data.map(d => d.attributes);
        } catch (error: any) {
            console.error('Pterodactyl Get Nests Error:', error.response?.data || error.message);
            return [];
        }
    }

    async getEggs(nestId: number): Promise<PterodactylEggAttributes[]> {
        try {
            const response = await this.client.get<{ data: { attributes: PterodactylEggAttributes }[] }>(`/application/nests/${nestId}/eggs`);
            return response.data.data.map(d => d.attributes);
        } catch (error: any) {
            console.error('Pterodactyl Get Eggs Error:', error.response?.data || error.message);
            return [];
        }
    }

    async getEggVariables(nestId: number, eggId: number): Promise<PterodactylEggVariable[]> {
        try {
            const response = await this.client.get<{ data: { attributes: PterodactylEggVariable }[] }>(`/application/nests/${nestId}/eggs/${eggId}?include=variables`);
            // The includes are nested in the response
            const eggData = (response.data as any).attributes;
            if (eggData.relationships?.variables?.data) {
                return eggData.relationships.variables.data.map((d: any) => d.attributes);
            }
            return [];
        } catch (error: any) {
            console.error('Pterodactyl Get Egg Variables Error:', error.response?.data || error.message);
            return [];
        }
    }

    async getAllocations(nodeId: number): Promise<PterodactylAllocationAttributes[]> {
        try {
            const response = await this.client.get<{ data: { attributes: PterodactylAllocationAttributes }[] }>(`/application/nodes/${nodeId}/allocations`);
            return response.data.data.map(d => d.attributes);
        } catch (error: any) {
            console.error('Pterodactyl Get Allocations Error:', error.response?.data || error.message);
            return [];
        }
    }

    async createServer(data: any): Promise<PterodactylServerAttributes> {
        try {
            const response = await this.client.post<{ attributes: PterodactylServerAttributes }>('/application/servers', data);
            return response.data.attributes;
        } catch (error: any) {
            console.error('Pterodactyl Create Server Error:', error.response?.data || error.message);
            if (error.response?.data?.errors) {
                throw new Error(error.response.data.errors.map((e: any) => e.detail).join(', '));
            }
            throw new Error('Failed to create server on Pterodactyl');
        }
    }

    async deleteServer(id: number, force: boolean = false): Promise<void> {
        try {
            await this.client.delete(`/application/servers/${id}${force ? '/force' : ''}`);
        } catch (error: any) {
            console.error('Pterodactyl Delete Server Error:', error.response?.data || error.message);
            throw new Error('Failed to delete server from Pterodactyl');
        }
    }
}

let pterodactylServiceInstance: PterodactylService | null = null;

try {
    pterodactylServiceInstance = new PterodactylService();
} catch (error) {
    console.warn("Pterodactyl Service could not be initialized:", error);
}

export const pterodactylService = pterodactylServiceInstance!;
export default PterodactylService;
