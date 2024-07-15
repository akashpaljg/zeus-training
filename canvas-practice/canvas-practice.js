window.onload = function() {
    var canvas = document.getElementById('tableCanvas');
    canvas.addEventListener("click", handleClick);
    var c = canvas.getContext('2d');

    const cellWidth = 150;
    const cellHeight = 50;
    const headerHeight = 30;

    // Column headers
    const headers = ["Id", "EmailId", "Name", "Country", "State", "City", "TelephoneNumber", "AddressLine1", "AddressLine2", "DateOfBirth", "FY2019_20", "FY2020_21", "FY2021_22", "FY2022_23", "FY2023_24"];
    
    // Sample data
    const sampleData = [
        { Id: 1, EmailId: "example1@example.com", Name: "John Doe", Country: "USA", State: "CA", City: "San Francisco", TelephoneNumber: "123-456-7890", AddressLine1: "123 Main St", AddressLine2: "Apt 4", DateOfBirth: "1990-01-01", FY2019_20: "Data1", FY2020_21: "Data2", FY2021_22: "Data3", FY2022_23: "Data4", FY2023_24: "Data5" },
        { Id: 2, EmailId: "example2@example.com", Name: "Jane Smith", Country: "Canada", State: "ON", City: "Toronto", TelephoneNumber: "234-567-8901", AddressLine1: "456 Elm St", AddressLine2: "Suite 1", DateOfBirth: "1985-05-15", FY2019_20: "Data6", FY2020_21: "Data7", FY2021_22: "Data8", FY2022_23: "Data9", FY2023_24: "Data10" }
    ];

    function drawCell(x, y, width, height, text, isHeader = false) {
        c.strokeStyle = 'black';
        c.lineWidth = 2;
        c.strokeRect(x, y, width, height);

        if (isHeader) {
            c.fillStyle = 'lightgray';
            c.fillRect(x, y, width, height);
        }

        c.fillStyle = isHeader ? 'green' : 'black';
        c.font = isHeader ? 'bold 14px Arial' : '12px Arial';
        
        const lines = getLines(c, text, width - 10);
        lines.forEach((line, index) => {
            c.fillText(line, x + 5, y + 20 + (index * 15));
        });
    }

    function getLines(ctx, text, maxWidth) {
        let lines = [];
        let currentLine = '';
        
        for (let char of text.toString()) {
            let testLine = currentLine + char;
            let width = ctx.measureText(testLine).width;
            
            if (width > maxWidth && currentLine !== '') {
                lines.push(currentLine);
                currentLine = char;
            } else {
                currentLine = testLine;
            }
        }
        
        if (currentLine !== '') {
            lines.push(currentLine);
        }
        
        return lines;
    }

    // Draw headers
    headers.forEach((header, index) => {
        drawCell(index * cellWidth, 0, cellWidth, headerHeight, header, true);
    });

    // Draw data
    sampleData.forEach((rowData, rowIndex) => {
        headers.forEach((header, colIndex) => {
            drawCell(colIndex * cellWidth, headerHeight + rowIndex * cellHeight, cellWidth, cellHeight, rowData[header]);
        });
    });

    function handleClick(event) {
        const rect = canvas.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;

        const colIndex = Math.floor(x / cellWidth);
        const rowIndex = Math.floor((y - headerHeight) / cellHeight);

        if (rowIndex >= 0 && rowIndex < sampleData.length && colIndex >= 0 && colIndex < headers.length) {
            const cellValue = sampleData[rowIndex][headers[colIndex]];
            alert(`Cell value: ${cellValue}`);
        }
    }
};
