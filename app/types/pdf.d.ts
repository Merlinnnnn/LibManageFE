declare module 'pdfjs-dist/build/pdf' {
  export const GlobalWorkerOptions: {
    workerSrc: string;
  };
  export const version: string;
  export function getDocument(options: { data: ArrayBuffer }): {
    promise: Promise<PDFDocumentProxy>;
  };
}

declare module 'pdfjs-dist/types/src/display/api' {
  export interface PDFDocumentProxy {
    numPages: number;
    getPage(pageNumber: number): Promise<PDFPageProxy>;
  }

  export interface PDFPageProxy {
    getViewport(options: { scale: number }): PDFPageViewport;
    render(options: {
      canvasContext: CanvasRenderingContext2D;
      viewport: PDFPageViewport;
    }): {
      promise: Promise<void>;
    };
  }

  export interface PDFPageViewport {
    width: number;
    height: number;
  }
} 