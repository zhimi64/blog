class WebDiff {
    constructor() {
        this.dmp = new diff_match_patch();
        this.processUrlParams();    
        this.setupEventListeners();
    }

    setupEventListeners() {
        document.getElementById('compareBtn').addEventListener('click', () => this.compareTasks());
        document.getElementById('downloadBtn').addEventListener('click', () => this.downloadPDF());
        document.getElementById('shareBtn').addEventListener('click', () => this.shareComparison());
        
        // File input handlers
        ['file1', 'file2'].forEach(id => {
            document.getElementById(id).addEventListener('change', (e) => this.handleFileInput(e));
        });
    }

    processUrlParams() {
        const urlParams = new URLSearchParams(window.location.search);
        const text1 = urlParams.get('text1');
        const text2 = urlParams.get('text2');

        if (text1 && text2) {
            document.getElementById('text1').value = decodeURIComponent(text1);
            document.getElementById('text2').value = decodeURIComponent(text2);
            this.compareTasks(); // Automatically compare when URL parameters are present
        }
    }

    async handleFileInput(event) {
        const file = event.target.files[0];
        if (file) {
            const text = await file.text();
            const textareaId = event.target.id === 'file1' ? 'text1' : 'text2';
            document.getElementById(textareaId).value = text;
        }
    }

    compareTasks() {
        const text1 = document.getElementById('text1').value;
        const text2 = document.getElementById('text2').value;

        const diffs = this.dmp.diff_main(text1, text2);
        this.dmp.diff_cleanupSemantic(diffs);

        const diffHtml = this.generateDiffHtml(diffs);
        document.getElementById('diffOutput').innerHTML = diffHtml;

        // Enable download and share buttons
        document.getElementById('downloadBtn').disabled = false;
        document.getElementById('shareBtn').disabled = false;
    }

    generateDiffHtml(diffs) {
        let leftColumn = '';
        let rightColumn = '';
        
        diffs.forEach(([type, text]) => {
            const escapedText = text.replace(/[<>&]/g, c => {
                return {'<': '&lt;', '>': '&gt;', '&': '&amp;'}[c];
            });
            
            switch(type) {
                case -1: // deletion
                    leftColumn += `<span class="deletion">${escapedText}</span>`;
                    break;
                case 1: // insertion
                    rightColumn += `<span class="insertion">${escapedText}</span>`;
                    break;
                case 0: // equal
                    leftColumn += `<span>${escapedText}</span>`;
                    rightColumn += `<span>${escapedText}</span>`;
                    break;
            }
        });

        return `
            <div class="diff-container">
                <div class="diff-column left-column">${leftColumn}</div>
                <div class="diff-column right-column">${rightColumn}</div>
            </div>`;
    }

    async downloadPDF() {
        const element = document.getElementById('diffOutput');
        const opt = {
            margin: 1,
            filename: 'comparison.pdf',
            image: { type: 'jpeg', quality: 0.98 },
            html2canvas: { scale: 2 },
            jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
        };

        try {
            await html2pdf().set(opt).from(element).save();
        } catch (error) {
            console.error('Error generating PDF:', error);
        }
    }

    shareComparison() {
        const text1 = encodeURIComponent(document.getElementById('text1').value);
        const text2 = encodeURIComponent(document.getElementById('text2').value);
        
        const shareUrl = `${window.location.origin}${window.location.pathname}?text1=${text1}&text2=${text2}`;
        
        // Copy to clipboard
        navigator.clipboard.writeText(shareUrl)
            .then(() => alert('Share link copied to clipboard!'))
            .catch(err => console.error('Error copying to clipboard:', err));
    }
}

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
    new WebDiff();
}); 