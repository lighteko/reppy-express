import { Express } from "express";
import { createClient, SupabaseClient as RawClient } from "@supabase/supabase-js";

interface SupabaseConfig {
    SUPABASE_URL: string;
    SUPABASE_SERVICE_ROLE_KEY: string;
}

class Supabase {
    private static instance: Supabase | null = null;
    private static client: RawClient | null = null;
    private static config: SupabaseConfig = {
        SUPABASE_URL: "",
        SUPABASE_SERVICE_ROLE_KEY: "",
    };
    private static initialized = false;

    private constructor() {
    }

    public static initApp(app: Express): void {
        const { SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY } = app.get("config");

        Supabase.config.SUPABASE_URL = SUPABASE_URL;
        Supabase.config.SUPABASE_SERVICE_ROLE_KEY = SUPABASE_SERVICE_ROLE_KEY;

        Supabase.client = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
        Supabase.initialized = true;
    }

    public static getInstance(): Supabase {
        if (!Supabase.initialized || !Supabase.client) {
            throw new Error("Supabase not initialized. Call Supabase.initApp() first.");
        }

        if (!Supabase.instance) {
            Supabase.instance = new Supabase();
        }

        return Supabase.instance;
    }

    public get auth() {
        return Supabase.client!.auth.admin; // 서비스 롤이므로 admin 사용 가능
    }

    public get db() {
        return Supabase.client!;
    }

    public async selectFrom<T = any>(table: string) {
        const { data, error } = await Supabase.client!.from(table).select("*");
        if (error) throw error;
        return data as T[];
    }

    public async insertInto(table: string, values: object | object[]) {
        const { error } = await Supabase.client!.from(table).insert(values);
        if (error) throw error;
    }

    public async deleteFrom(table: string, match: Record<string, any>) {
        const { error } = await Supabase.client!.from(table).delete().match(match);
        if (error) throw error;
    }
}

export default Supabase;
