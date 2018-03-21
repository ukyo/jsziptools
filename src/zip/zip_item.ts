import {BufferLike} from '../common';

export interface ZipItem {
    name: string
    dir?: ZipItem[]
    folder?: ZipItem[]
    children?: ZipItem[]
    buffer?: BufferLike
    url?: string
    level?: number
}
