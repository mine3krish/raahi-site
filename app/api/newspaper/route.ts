import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/app/api/connect";
import Property from "@/models/Property";
import { PDFDocument, rgb, StandardFonts } from "pdf-lib";
import fs from "fs";
import path from "path";

// Helper function to parse Indian date formats
function parseIndianDate(dateStr: string): Date | null {
  if (!dateStr) return null;
  
  try {
    // Remove extra spaces and clean the string
    const cleaned = dateStr.trim().replace(/\s+/g, ' ');
    
    // Common Indian date formats
    const formats = [
      // DD-MM-YYYY or DD/MM/YYYY
      /^(\d{1,2})[-\/](\d{1,2})[-\/](\d{4})/,
      // DD.MM.YYYY
      /^(\d{1,2})\.(\d{1,2})\.(\d{4})/,
      // DD Month YYYY (e.g., 15 December 2025)
      /^(\d{1,2})\s+(January|February|March|April|May|June|July|August|September|October|November|December)\s+(\d{4})/i,
      // Month DD, YYYY (e.g., December 15, 2025)
      /^(January|February|March|April|May|June|July|August|September|October|November|December)\s+(\d{1,2}),?\s+(\d{4})/i,
    ];
    
    for (const format of formats) {
      const match = cleaned.match(format);
      if (match) {
        if (format.source.includes('January')) {
          // Month name format
          const months: { [key: string]: number } = {
            'january': 0, 'february': 1, 'march': 2, 'april': 3,
            'may': 4, 'june': 5, 'july': 6, 'august': 7,
            'september': 8, 'october': 9, 'november': 10, 'december': 11
          };
          
          if (match[1].toLowerCase() in months) {
            // Month DD, YYYY format
            const month = months[match[1].toLowerCase()];
            const day = parseInt(match[2]);
            const year = parseInt(match[3]);
            return new Date(year, month, day);
          } else {
            // DD Month YYYY format
            const day = parseInt(match[1]);
            const month = months[match[2].toLowerCase()];
            const year = parseInt(match[3]);
            return new Date(year, month, day);
          }
        } else {
          // Numeric DD-MM-YYYY format
          const day = parseInt(match[1]);
          const month = parseInt(match[2]) - 1; // JS months are 0-indexed
          const year = parseInt(match[3]);
          return new Date(year, month, day);
        }
      }
    }
    
    // Try standard ISO format as fallback
    const isoDate = new Date(dateStr);
    if (!isNaN(isoDate.getTime())) {
      return isoDate;
    }
  } catch (e) {
    console.error('Error parsing date:', dateStr, e);
  }
  
  return null;
}

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const searchParams = request.nextUrl.searchParams;
    const date = searchParams.get("date") || new Date().toISOString().split("T")[0];
    const state = searchParams.get("state");
    const filterBy = searchParams.get("filterBy") || "created"; // 'created' or 'auction'
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");

    let query: any = {
      status: "Active",
    };

    if (state && state !== "all") {
      query.state = state;
    }

    let properties: any[] = [];

    // Filter by created date or auction date
    if (filterBy === "created") {
      const startOfDay = new Date(date + "T00:00:00.000Z");
      const endOfDay = new Date(date + "T23:59:59.999Z");
      
      query.createdAt = {
        $gte: startOfDay,
        $lte: endOfDay,
      };
      
      console.log("Searching by created date between:", startOfDay, "and", endOfDay);
    } else if (filterBy === "auction" && startDate && endDate) {
      // Fetch all active properties and filter by auction date
      const allProperties = await Property.find({ 
        status: "Active",
        ...(state && state !== "all" ? { state } : {})
      });
      
      const start = new Date(startDate);
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999); // Include end of day
      
      console.log("Filtering by auction date between:", start, "and", end);
      
      const filteredProperties = allProperties.filter(property => {
        const auctionDate = parseIndianDate(property.AuctionDate);
        if (!auctionDate) return false;
        return auctionDate >= start && auctionDate <= end;
      });
      
      if (filteredProperties.length === 0) {
        return NextResponse.json(
          { 
            error: `No properties found with auction dates between ${startDate} and ${endDate}`,
            debug: {
              filterBy,
              startDate,
              endDate,
              totalProperties: allProperties.length
            }
          },
          { status: 404 }
        );
      }
      
      // Use filtered properties for PDF generation
      console.log(`Found ${filteredProperties.length} properties with auction dates between ${startDate} and ${endDate}`);
      
      // Continue to PDF generation with filteredProperties
      properties = filteredProperties;
    } else {
      // Get properties by created date
      properties = await Property.find(query).sort({ createdAt: -1 });
      
      console.log(`Found ${properties.length} properties`);

      if (properties.length === 0) {
        return NextResponse.json(
          { 
            error: `No properties found for the selected criteria`,
            debug: {
              filterBy,
              date,
              state
            }
          },
          { status: 404 }
        );
      }
    }

    // Create PDF
    const pdfDoc = await PDFDocument.create();
    const helvetica = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const helveticaBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

    // Load and embed logo
    let logoImage = null;
    try {
      const logoPath = path.join(process.cwd(), "public", "logo.png");
      if (fs.existsSync(logoPath)) {
        const logoBytes = fs.readFileSync(logoPath);
        logoImage = await pdfDoc.embedPng(logoBytes);
      }
    } catch (logoError) {
      console.log("Logo not found, continuing without it");
    }

    const pageWidth = 595.28; // A4 width
    const pageHeight = 841.89; // A4 height
    const margin = 40;
    const contentWidth = pageWidth - 2 * margin;

    let page = pdfDoc.addPage([pageWidth, pageHeight]);
    let yPosition = pageHeight - margin;

    // Helper function to add new page if needed
    const checkNewPage = (requiredSpace: number) => {
      if (yPosition - requiredSpace < margin + 30) {
        page = pdfDoc.addPage([pageWidth, pageHeight]);
        yPosition = pageHeight - margin;
        return true;
      }
      return false;
    };

    // Modern Header with white background
    // White background for logo
    page.drawRectangle({
      x: 0,
      y: yPosition - 60,
      width: pageWidth,
      height: 65,
      color: rgb(1, 1, 1), // White
    });

    // Green bottom border
    page.drawRectangle({
      x: 0,
      y: yPosition - 63,
      width: pageWidth,
      height: 3,
      color: rgb(0.067, 0.502, 0.227), // Green
    });

    // Draw logo if available
    if (logoImage) {
      const logoHeight = 40;
      const logoWidth = 40;
      page.drawImage(logoImage, {
        x: margin,
        y: yPosition - 52,
        width: logoWidth,
        height: logoHeight,
      });
      
      // Company name next to logo
      page.drawText("RAAHI AUCTION", {
        x: margin + logoWidth + 12,
        y: yPosition - 28,
        size: 22,
        font: helveticaBold,
        color: rgb(0.067, 0.502, 0.227),
      });

      page.drawText("Property Newspaper", {
        x: margin + logoWidth + 12,
        y: yPosition - 45,
        size: 9,
        font: helvetica,
        color: rgb(0.3, 0.3, 0.3),
      });
    } else {
      page.drawText("RAAHI AUCTION", {
        x: margin,
        y: yPosition - 28,
        size: 24,
        font: helveticaBold,
        color: rgb(0.067, 0.502, 0.227),
      });

      page.drawText("Property Newspaper", {
        x: margin,
        y: yPosition - 45,
        size: 10,
        font: helvetica,
        color: rgb(0.3, 0.3, 0.3),
      });
    }
    
    const formattedDate = new Date(date).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
    
    // Right side info box
    const infoBoxWidth = 180;
    const infoBoxX = pageWidth - margin - infoBoxWidth;
    
    page.drawRectangle({
      x: infoBoxX,
      y: yPosition - 50,
      width: infoBoxWidth,
      height: 40,
      color: rgb(0.067, 0.502, 0.227),
    });

    page.drawText(formattedDate, {
      x: infoBoxX + 10,
      y: yPosition - 28,
      size: 10,
      font: helveticaBold,
      color: rgb(1, 1, 1),
    });
    
    const stateText = state && state !== "all" ? state : "All India";
    const countText = `${properties.length} ${properties.length === 1 ? 'Property' : 'Properties'} Listed`;
    
    page.drawText(`${stateText} | ${countText}`, {
      x: infoBoxX + 10,
      y: yPosition - 42,
      size: 8,
      font: helvetica,
      color: rgb(0.95, 0.95, 0.95),
    });
    
    yPosition -= 75;

    // Modern card-based layout (single column for better readability)
    const cardPadding = 16;
    const cardMarginBottom = 30;
    
    // Helper function to wrap text
    const wrapText = (text: string, maxWidth: number, fontSize: number, font: any) => {
      const words = text.split(' ');
      const lines: string[] = [];
      let currentLine = '';
      
      for (const word of words) {
        const testLine = currentLine ? `${currentLine} ${word}` : word;
        const testWidth = font.widthOfTextAtSize(testLine, fontSize);
        
        if (testWidth > maxWidth && currentLine) {
          lines.push(currentLine);
          currentLine = word;
        } else {
          currentLine = testLine;
        }
      }
      
      if (currentLine) {
        lines.push(currentLine);
      }
      
      return lines;
    };

    for (let i = 0; i < properties.length; i++) {
      const property = properties[i];
      const xPosition = margin;
      
      // Clean special characters
      const cleanName = property.name.replace(/[^\x00-\x7F]/g, "");
      const cleanLocation = (property.location === "None" 
        ? property.state 
        : `${property.location}, ${property.state}`).replace(/[^\x00-\x7F]/g, "");
      
      // Calculate title lines
      const titleLines = wrapText(cleanName, contentWidth - 2 * cardPadding - 60, 12, helveticaBold);
      const titleHeight = titleLines.length * 15;
      
      // Dynamic card height based on content
      const baseCardHeight = 165;
      const cardHeight = baseCardHeight + Math.max(0, (titleLines.length - 1) * 15);
      
      const newPage = checkNewPage(cardHeight + cardMarginBottom);
      if (newPage) {
        // Add a subtle separator for new page
        page.drawRectangle({
          x: margin,
          y: yPosition - 5,
          width: contentWidth,
          height: 1,
          color: rgb(0.9, 0.9, 0.9),
        });
        yPosition -= 10;
      }

      // Modern card with shadow
      page.drawRectangle({
        x: xPosition + 2,
        y: yPosition - cardHeight + 2,
        width: contentWidth,
        height: cardHeight,
        color: rgb(0.88, 0.88, 0.88),
      });

      // Card background
      page.drawRectangle({
        x: xPosition,
        y: yPosition - cardHeight,
        width: contentWidth,
        height: cardHeight,
        color: rgb(1, 1, 1),
        borderColor: rgb(0.85, 0.85, 0.85),
        borderWidth: 1.5,
      });

      // Left accent bar
      page.drawRectangle({
        x: xPosition,
        y: yPosition - cardHeight,
        width: 4,
        height: cardHeight,
        color: rgb(0.067, 0.502, 0.227),
      });

      let currentY = yPosition - cardPadding - 10;

      // Property ID Badge
      const idBadgeWidth = 50;
      page.drawRectangle({
        x: xPosition + cardPadding,
        y: currentY - 16,
        width: idBadgeWidth,
        height: 18,
        color: rgb(0.067, 0.502, 0.227),
      });
      
      const idText = `#${property.id}`;
      const idTextWidth = helveticaBold.widthOfTextAtSize(idText, 9);
      page.drawText(idText, {
        x: xPosition + cardPadding + (idBadgeWidth - idTextWidth) / 2,
        y: currentY - 12,
        size: 9,
        font: helveticaBold,
        color: rgb(1, 1, 1),
      });
      currentY -= 26;

      // Property Title (NOT truncated, wrapped to multiple lines)
      titleLines.forEach((line, index) => {
        page.drawText(line, {
          x: xPosition + cardPadding,
          y: currentY - (index * 15),
          size: 12,
          font: helveticaBold,
          color: rgb(0.1, 0.1, 0.1),
        });
      });
      currentY -= titleHeight + 6;

      // Location with marker
      page.drawText(">>", {
        x: xPosition + cardPadding,
        y: currentY,
        size: 8,
        font: helveticaBold,
        color: rgb(0.067, 0.502, 0.227),
      });
      
      page.drawText(cleanLocation, {
        x: xPosition + cardPadding + 18,
        y: currentY,
        size: 9,
        font: helvetica,
        color: rgb(0.4, 0.4, 0.4),
      });
      currentY -= 16;

      // Divider line
      page.drawRectangle({
        x: xPosition + cardPadding,
        y: currentY - 2,
        width: contentWidth - 2 * cardPadding,
        height: 1,
        color: rgb(0.92, 0.92, 0.92),
      });
      currentY -= 10;

      // Info grid layout (3 columns)
      const col1X = xPosition + cardPadding;
      const col2X = xPosition + cardPadding + 170;
      const col3X = xPosition + cardPadding + 340;
      
      // Property Type
      page.drawText("Property Type", {
        x: col1X,
        y: currentY,
        size: 7,
        font: helvetica,
        color: rgb(0.5, 0.5, 0.5),
      });
      
      page.drawText(property.type, {
        x: col1X,
        y: currentY - 12,
        size: 10,
        font: helveticaBold,
        color: rgb(0.15, 0.15, 0.15),
      });

      // Area (if available)
      if (property.area) {
        page.drawText("Area", {
          x: col2X,
          y: currentY,
          size: 7,
          font: helvetica,
          color: rgb(0.5, 0.5, 0.5),
        });
        
        const areaText = property.area.toLocaleString("en-IN") + " sq ft";
        const cleanAreaText = areaText.replace(/[^\x00-\x7F]/g, "");
        page.drawText(cleanAreaText, {
          x: col2X,
          y: currentY - 12,
          size: 10,
          font: helveticaBold,
          color: rgb(0.15, 0.15, 0.15),
        });
      }
      
      // Auction Date
      page.drawText("Auction Date", {
        x: col3X,
        y: currentY,
        size: 7,
        font: helvetica,
        color: rgb(0.5, 0.5, 0.5),
      });
      
      const cleanAuctionDate = property.AuctionDate.replace(/[^\x00-\x7F]/g, "");
      const auctionLines = wrapText(cleanAuctionDate, 120, 9, helvetica);
      auctionLines.slice(0, 2).forEach((line, idx) => {
        page.drawText(line, {
          x: col3X,
          y: currentY - 12 - (idx * 11),
          size: 9,
          font: helvetica,
          color: rgb(0.15, 0.15, 0.15),
        });
      });
      
      currentY -= 30;

      // Price section with modern gradient-like background
      page.drawRectangle({
        x: xPosition + cardPadding - 4,
        y: currentY - 42,
        width: contentWidth - 2 * cardPadding + 8,
        height: 46,
        color: rgb(0.953, 0.976, 0.961),
      });

      // Left border accent
      page.drawRectangle({
        x: xPosition + cardPadding - 4,
        y: currentY - 42,
        width: 3,
        height: 46,
        color: rgb(0.067, 0.502, 0.227),
      });

      currentY -= 12;

      // Reserve Price (left)
      page.drawText("RESERVE PRICE", {
        x: xPosition + cardPadding + 4,
        y: currentY,
        size: 7,
        font: helveticaBold,
        color: rgb(0.4, 0.4, 0.4),
      });
      
      const priceText = `Rs. ${property.reservePrice.toLocaleString("en-IN")}`;
      page.drawText(priceText, {
        x: xPosition + cardPadding + 4,
        y: currentY - 16,
        size: 14,
        font: helveticaBold,
        color: rgb(0.067, 0.502, 0.227),
      });

      // EMD (right)
      page.drawText("EMD", {
        x: xPosition + contentWidth - cardPadding - 150,
        y: currentY,
        size: 7,
        font: helveticaBold,
        color: rgb(0.4, 0.4, 0.4),
      });
      
      const emdText = `Rs. ${property.EMD.toLocaleString("en-IN")}`;
      page.drawText(emdText, {
        x: xPosition + contentWidth - cardPadding - 150,
        y: currentY - 16,
        size: 12,
        font: helveticaBold,
        color: rgb(0.3, 0.3, 0.3),
      });
      
      currentY -= 38;

      // Website footer in card
      page.drawText("www.raahiauction.com", {
        x: xPosition + cardPadding,
        y: currentY,
        size: 7,
        font: helvetica,
        color: rgb(0.6, 0.6, 0.6),
      });

      yPosition = yPosition - cardHeight - cardMarginBottom;
    }

    // Modern Footer on all pages
    const pages = pdfDoc.getPages();
    pages.forEach((pg, idx) => {
      // Footer background with gradient effect
      pg.drawRectangle({
        x: 0,
        y: 0,
        width: pageWidth,
        height: 35,
        color: rgb(0.067, 0.502, 0.227),
      });

      // Top accent line
      pg.drawRectangle({
        x: 0,
        y: 35,
        width: pageWidth,
        height: 2,
        color: rgb(0.957, 0.612, 0.071),
      });
      
      // Contact info
      pg.drawText("Phone: +91 848 884 8874", {
        x: margin,
        y: 14,
        size: 8,
        font: helvetica,
        color: rgb(1, 1, 1),
      });
      
      // Website (center)
      pg.drawText("www.raahiauction.com", {
        x: pageWidth / 2 - 60,
        y: 14,
        size: 9,
        font: helveticaBold,
        color: rgb(1, 1, 1),
      });
      
      // Email
      pg.drawText("Email: contact@raahiauction.com", {
        x: pageWidth - margin - 165,
        y: 14,
        size: 8,
        font: helvetica,
        color: rgb(1, 1, 1),
      });

      // Page number (top right of footer)
      const pageText = `Page ${idx + 1} of ${pages.length}`;
      pg.drawText(pageText, {
        x: pageWidth - margin - 50,
        y: 40,
        size: 7,
        font: helvetica,
        color: rgb(0.5, 0.5, 0.5),
      });
    });

    const pdfBytes = await pdfDoc.save();

    return new NextResponse(Buffer.from(pdfBytes), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="raahi-auction-daily-${date}.pdf"`,
      },
    });
  } catch (error) {
    console.error("Newspaper generation error:", error);
    const errorMessage = error instanceof Error ? error.message : "Failed to generate newspaper";
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}
