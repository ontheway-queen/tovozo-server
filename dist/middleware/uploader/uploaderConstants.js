"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FILE_STORAGE_HOST = exports.ROOT_FILE_FOLDER = exports.allowAllFileTypes = void 0;
// Allow file mimetypes
exports.allowAllFileTypes = [
    'image/jpeg',
    'application/octet-stream',
    'image/jpg',
    'image/JPG',
    'image/JPEG',
    'image/png',
    'image/webp',
    'application/postscript',
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
];
// Root file folder name
exports.ROOT_FILE_FOLDER = 'booking-expert-v2';
// file storage host
exports.FILE_STORAGE_HOST = 'https://m360ict.s3.ap-south-1.amazonaws.com/booking-expert-v2';
