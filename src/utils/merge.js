import { PDFDocument } from 'pdf-lib';

const A4_WIDTH = 595;
const A4_HEIGHT = 842;

async function mergePDFs(sources) {
    try {
        const mergedPdf = await PDFDocument.create();
        const page = mergedPdf.addPage([A4_WIDTH, A4_HEIGHT])
        const { width, height } = page.getSize();
        page.drawText('You can create PDFs!')

        for (const { url, pages } of sources) {
            console.log(url)
            const arrayBuffer = await fetch(url).then((res) => res.arrayBuffer());
            const srcPdf = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });

            for (const pageIndex of pages) {
                const [copiedPage] = await mergedPdf.copyPages(srcPdf, [pageIndex]);
                const { width, height } = copiedPage.getSize();

                // Re-embed the page contents by loading againn
                const reloadedSrc = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });
                const embedded = await mergedPdf.embedPage(
                    reloadedSrc.getPages()[pageIndex]
                );

                const scale = Math.min(A4_WIDTH / width, A4_HEIGHT / height);
                const x = (A4_WIDTH - width * scale) / 2;
                const y = (A4_HEIGHT - height * scale) / 2;

                const newPage = mergedPdf.addPage([A4_WIDTH, A4_HEIGHT]);
                newPage.drawPage(embedded, {
                    x,
                    y,
                    xScale: scale,
                    yScale: scale,
                });
            }
        }

        const mergedBytes = await mergedPdf.save();
        const blob = new Blob([mergedBytes], { type: 'application/pdf' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'merged.pdf';
        link.click();
    } catch (error) {
        console.log(error)
    }
}

export default mergePDFs;