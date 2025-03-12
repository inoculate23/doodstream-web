import {
    DEFAULT_PER_PAGE,
    DEFAULT_REVALIDATE_INTERVAL,
    STREAMTAPE_API_KEY,
    STREAMTAPE_BASE_URL,
    STREAMTAPE_LOGIN,
STREAMTAPE_FOLDER,
} from "./constants";

type STREAMTAPEProps = {
    baseUrl?: string;
    login?: string;
    key?: string;
    folder?: string;
};

class STREAMTAPE {
    baseUrl: string;
    key: string;
    login: string;
    folder: string;

    upstream: string | undefined;

    constructor(
        { baseUrl, login, key }: STREAMTAPEProps = {
            baseUrl: undefined,
            login: undefined,
            key: undefined,
            folder: undefined,
        }
    ) {
        baseUrl = baseUrl || STREAMTAPE_BASE_URL;
        login = login || STREAMTAPE_LOGIN;
        key = key || STREAMTAPE_API_KEY;
        folder = folder || STREAMTAPE_FOLDER;
        
        if (!baseUrl) throw new Error("STREAMTAPE Base URL not set");
        if (!login) throw new Error("STREAMTAPE Login not set");
        if (!key) throw new Error("STREAMTAPE Key not set");

        this.baseUrl = baseUrl;
        this.login = login;
        this.key = key;
        this.folder = folder;
    }

    serializeQueryParams(params: { [key: string]: string }) {
        return new URLSearchParams(params).toString();
    }

    async fetch(
        cmd: string,
        params: { [key: string]: string },
        revalidate?: number
    ) {
        params.key = this.key;
        const url = `${this.baseUrl}/api${cmd}?${this.serializeQueryParams(
            params
        )}`;
        const response = await fetch(url, {
            next: { revalidate: revalidate || DEFAULT_REVALIDATE_INTERVAL },
        });
        return await response.json();
    }

    async listFiles({
        page = 1,
        per_page = DEFAULT_PER_PAGE,
        folder = folder,
    }: {
        page?: number;
        per_page?: number;
        folder?: string;
    }) {
        if (per_page && per_page > 200)
            throw new Error("per_page cannot be greater than 200");

        const data = await this.fetch(
            "/file/list",
            {
                page: page.toString(),
                per_page: per_page.toString(),
                folder: folder.toString(),
            },
            60
        );
        return data;
    }

    async getFile({ file_code }: { file_code: string }) {
        const data = await this.fetch("/file/info", { file_code });
        return data;
    }

    async search({ query }: { query: string }) {
        const data = await this.fetch(
            "/search/videos",
            { search_term: query },
            60
        );
        return data;
    }

    async listFolders({ folder = "" }: { folder?: string }) {
        const data = await this.fetch("/folder/list", {
            only_folders: "1",
            folder,
        });
        return data;
    }

    async getFolder({ folder }: { folder: string }) {
        const data = await this.listFolders({ folder: "" });
       
        return {
            ...data,
            folder,
        };
    }

    async getUpstream() {
        if (this.upstream) return this.upstream;

        const data = await this.listFiles({ page: 1, per_page: 1 });
        const sampleFile = data.result.files[0];
        const url = new URL(sampleFile.download_url);
        this.upstream = url.hostname;

        setTimeout(() => {
            this.upstream = undefined;
        }, DEFAULT_REVALIDATE_INTERVAL * 1000);
        return url.hostname;
    }
}

//const STREAMTAPE = new STREAMTAPE();

export default STREAMTAPE;
