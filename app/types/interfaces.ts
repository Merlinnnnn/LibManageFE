// API Response Interfaces
export interface GenericApiResponse<T> {
    code: number;
    data: T;
    message?: string;
}

export interface ApiResponse<T> {
    code: number;
    data: {
        content: T[];
        last: boolean;
        pageNumber: number;
        pageSize: number;
        sortDetails: any[];
        totalElements: number;
        totalPages: number;
    };
    message: string;
    success: boolean;
}

export interface BooksApiResponse {
    code: number;
    message: string;
    data: {
        content: Book[];
        pageNumber: number;
        pageSize: number;
        totalElements: number;
        totalPages: number;
        last: boolean;
    };
}

// Document Interfaces
export interface Upload {
    uploadId: number;
    fileName: string;
    fileType: string;
    filePath: string;
    uploadedAt: string;
}

export interface DigitalDocument {
    digitalDocumentId: number;
    documentName: string;
    author: string;
    publisher: string;
    description: string;
    coverImage: string | null;
    uploads: Upload[];
}

export interface PhysicalDocument {
    physicalDocumentId: number;
    documentName: string;
    author: string;
    publisher: string;
    description: string;
    coverImage: string | null;
    isbn: string;
    quantity: number;
    borrowedCount: number;
    unavailableCount: number;
    availableCopies: number;
}

export interface DocumentType {
    documentTypeId: number;
    typeName: string;
    description: string;
}

export interface Course {
    courseId: number;
    courseCode: string;
    courseName: string;
    description: string;
}

export interface Book {
    documentId: number;
    documentName: string;
    author: string;
    publisher: string;
    publishedDate: string | null;
    language: string | null;
    quantity: number;
    description: string;
    coverImage: string | null;
    documentCategory: string;
    documentTypes: DocumentType[];
    courses: Course[];
    physicalDocument: PhysicalDocument | null;
    digitalDocument: DigitalDocument | null;
}

// Dashboard Interfaces
export interface DocumentStatistics {
    totalDocuments: number;
    borrowedDocuments: number;
    availableDocuments: number;
    disabledDocuments: number;
    documentsByType: {
        typeName: string;
        count: number;
    }[];
    documentsByCourseCode: {
        courseCode: string;
        count: number;
        year: number;
    }[];
}

export interface UserRoleData {
    totalUsers: number;
    usersByRole: {
        ADMIN: number;
        MANAGER: number;
        USER: number;
    };
}

export interface UserRoleResponse {
    code: number;
    message: string;
    result: UserRoleData;
}

// Access Request Interfaces
export interface AccessRequest {
    id: number;
    uploadId: number;
    requesterId: string;
    ownerId: string;
    status: string;
    requestTime: string;
    decisionTime: string | null;
    reviewerId: string | null;
    licenseExpiry: string | null;
}

export interface AccessListResponse {
    code: number;
    success: boolean;
    message: string;
    data: {
        uploadId: number;
        totalBorrowers: number;
        borrowers: AccessRequest[];
    };
}

// MyBookShelf Interfaces
export interface MyBookShelfBook {
    id: number;
    title: string;
    author: string;
    coverImage: string;
    uploadDate: string;
    fileSize: string;
    documentType: string;
    courses: string[];
    isPublic: boolean;
    wordFile?: string;
    pdfFile?: string;
    mp4File?: string;
}

export interface FavoriteBook {
    documentId: string;
    documentName: string;
    author: string;
    coverImage: string;
    uploadDate: string;
    fileSize: string;
    documentType: string;
    courses: string[];
    wordFile?: string;
    pdfFile?: string;
    mp4File?: string;
}

// Other Interfaces
export interface Res {
    code: number;
    message: string;
    result: number;
} 