export interface SongFile {
    name: string;
    fileName?: string;
    content?: string;
}

export interface FilesResponse {
    [key: string]: string[];
}

export interface FilesTreeNode {
    f: SongFile;
    children?: FilesTreeNode[];
}