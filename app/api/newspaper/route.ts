import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/app/api/connect";
import Property from "@/models/Property";
import { PDFDocument, rgb, StandardFonts } from "pdf-lib";

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const searchParams = request.nextUrl.searchParams;
    const date = searchParams.get("date") || new Date().toISOString().split("T")[0];
    const state = searchParams.get("state");

    // Get properties created on the specified date (UTC time)
    const startOfDay = new Date(date + "T00:00:00.000Z");
    const endOfDay = new Date(date + "T23:59:59.999Z");

    console.log("Searching for properties between:", startOfDay, "and", endOfDay);

    const query: any = {
      createdAt: {
        $gte: startOfDay,
        $lte: endOfDay,
      },
      status: "Active",
    };

    if (state && state !== "all") {
      query.state = state;
    }

    const properties = await Property.find(query).sort({ createdAt: -1 });

    console.log(`Found ${properties.length} properties for date ${date}`);

    if (properties.length === 0) {
      // If no properties found for exact date, try returning all properties as fallback for testing
      const allProperties = await Property.find({ status: "Active" }).limit(10).sort({ createdAt: -1 });
      
      return NextResponse.json(
        { 
          error: `No properties found for ${date}. Total active properties: ${allProperties.length}`,
          debug: {
            searchDate: date,
            startOfDay: startOfDay.toISOString(),
            endOfDay: endOfDay.toISOString(),
            recentProperties: allProperties.map(p => ({
              id: p.id,
              name: p.name,
              createdAt: p.createdAt
            }))
          }
        },
        { status: 404 }
      );
    }

    // Create PDF
    const pdfDoc = await PDFDocument.create();
    const timesRoman = await pdfDoc.embedFont(StandardFonts.TimesRoman);
    const timesRomanBold = await pdfDoc.embedFont(StandardFonts.TimesRomanBold);
    const timesRomanItalic = await pdfDoc.embedFont(StandardFonts.TimesRomanItalic);

    const pageWidth = 595.28; // A4 width
    const pageHeight = 841.89; // A4 height
    const margin = 40;
    const contentWidth = pageWidth - 2 * margin;

    let page = pdfDoc.addPage([pageWidth, pageHeight]);
    let yPosition = pageHeight - margin;

    // Helper function to add new page if needed
    const checkNewPage = (requiredSpace: number) => {
      if (yPosition - requiredSpace < margin) {
        page = pdfDoc.addPage([pageWidth, pageHeight]);
        yPosition = pageHeight - margin;
      }
    };

    // Modern Header with green background
    page.drawRectangle({
      x: 0,
      y: yPosition - 40,
      width: pageWidth,
      height: 45,
      color: rgb(0.086, 0.639, 0.290), // Green
    });
    
    page.drawText("RAAHI AUCTION", {
      x: margin,
      y: yPosition - 25,
      size: 20,
      font: timesRomanBold,
      color: rgb(1, 1, 1),
    });
    
    const formattedDate = new Date(date).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
    
    const headerRight = state && state !== "all" 
      ? `${formattedDate} | ${state} | ${properties.length} Properties` 
      : `${formattedDate} | ${properties.length} Properties Listed`;
    
    page.drawText(headerRight, {
      x: pageWidth - margin - 200,
      y: yPosition - 25,
      size: 10,
      font: timesRomanBold,
      color: rgb(1, 1, 1),
    });
    
    yPosition -= 55;

    // Modern card-based layout (2 columns)
    const columnGap = 15;
    const columnWidth = (contentWidth - columnGap) / 2;
    const cardHeight = 155;
    const cardPadding = 12;
    const cardRadius = 4;
    let currentColumn = 0;
    let columnYPosition = yPosition;

    for (let i = 0; i < properties.length; i++) {
      const property = properties[i];
      const xPosition = margin + currentColumn * (columnWidth + columnGap);
      
      checkNewPage(cardHeight + 15);
      
      if (currentColumn === 1) {
        columnYPosition = yPosition;
      }

      // Card shadow effect
      page.drawRectangle({
        x: xPosition + 1,
        y: columnYPosition - cardHeight - 1,
        width: columnWidth,
        height: cardHeight,
        color: rgb(0.85, 0.85, 0.85),
      });

      // Card background
      page.drawRectangle({
        x: xPosition,
        y: columnYPosition - cardHeight,
        width: columnWidth,
        height: cardHeight,
        color: rgb(1, 1, 1),
        borderColor: rgb(0.88, 0.88, 0.88),
        borderWidth: 1,
      });

      // Green top bar
      page.drawRectangle({
        x: xPosition,
        y: columnYPosition - 3,
        width: columnWidth,
        height: 3,
        color: rgb(0.086, 0.639, 0.290),
      });

      let currentY = columnYPosition - cardPadding - 8;

      // Property ID Badge (smaller, cleaner)
      const idText = `#${property.id}`;
      page.drawText(idText, {
        x: xPosition + cardPadding,
        y: currentY,
        size: 8,
        font: timesRomanBold,
        color: rgb(0.086, 0.639, 0.290),
      });
      currentY -= 16;

      // Property Name (bold, larger) - clean special characters
      const maxNameLength = 38;
      const cleanName = property.name.replace(/[^\x00-\x7F]/g, "");
      const propertyName = cleanName.length > maxNameLength 
        ? cleanName.substring(0, maxNameLength - 3) + "..." 
        : cleanName;
      
      page.drawText(propertyName, {
        x: xPosition + cardPadding,
        y: currentY,
        size: 10,
        font: timesRomanBold,
        color: rgb(0.1, 0.1, 0.1),
        maxWidth: columnWidth - 2 * cardPadding,
      });
      currentY -= 15;

      // Location with icon-like prefix - clean special characters
      const locationText = property.location === "None" 
        ? property.state 
        : `${property.location}, ${property.state}`;
      const cleanLocation = locationText.replace(/[^\x00-\x7F]/g, "");
      const maxLocationLength = 42;
      const truncatedLocation = cleanLocation.length > maxLocationLength 
        ? cleanLocation.substring(0, maxLocationLength - 3) + "..." 
        : cleanLocation;
      
      page.drawText(truncatedLocation, {
        x: xPosition + cardPadding,
        y: currentY,
        size: 8,
        font: timesRoman,
        color: rgb(0.45, 0.45, 0.45),
        maxWidth: columnWidth - 2 * cardPadding,
      });
      currentY -= 18;

      // Info section with clean spacing
      const infoY = currentY;
      
      // Property Type
      page.drawText("Type", {
        x: xPosition + cardPadding,
        y: infoY,
        size: 7,
        font: timesRoman,
        color: rgb(0.5, 0.5, 0.5),
      });
      
      page.drawText(property.type, {
        x: xPosition + cardPadding,
        y: infoY - 9,
        size: 8,
        font: timesRomanBold,
        color: rgb(0.2, 0.2, 0.2),
      });

      // Area (if available)
      if (property.area) {
        page.drawText("Area", {
          x: xPosition + cardPadding + 80,
          y: infoY,
          size: 7,
          font: timesRoman,
          color: rgb(0.5, 0.5, 0.5),
        });
        
        const areaText = property.area.toLocaleString() + " sq ft";
        const cleanAreaText = areaText.replace(/[^\x00-\x7F]/g, ""); // Remove non-ASCII characters
        page.drawText(cleanAreaText.length > 15 ? cleanAreaText.substring(0, 12) + "..." : cleanAreaText, {
          x: xPosition + cardPadding + 80,
          y: infoY - 9,
          size: 8,
          font: timesRomanBold,
          color: rgb(0.2, 0.2, 0.2),
        });
      }
      
      currentY -= 28;

      // Price section with background
      page.drawRectangle({
        x: xPosition + cardPadding - 3,
        y: currentY - 32,
        width: columnWidth - 2 * cardPadding + 6,
        height: 30,
        color: rgb(0.96, 0.99, 0.97),
      });

      // Reserve Price
      page.drawText("Reserve Price", {
        x: xPosition + cardPadding,
        y: currentY - 8,
        size: 7,
        font: timesRoman,
        color: rgb(0.4, 0.4, 0.4),
      });
      
      const priceText = `Rs. ${property.reservePrice.toLocaleString("en-IN")}`;
      page.drawText(priceText, {
        x: xPosition + cardPadding,
        y: currentY - 20,
        size: 11,
        font: timesRomanBold,
        color: rgb(0.086, 0.639, 0.290),
      });

      // EMD (right side)
      const emdText = `EMD: Rs. ${property.EMD.toLocaleString("en-IN")}`;
      const emdTextShort = emdText.length > 25 ? emdText.substring(0, 22) + "..." : emdText;
      page.drawText(emdTextShort, {
        x: xPosition + columnWidth - cardPadding - 80,
        y: currentY - 20,
        size: 7,
        font: timesRoman,
        color: rgb(0.3, 0.3, 0.3),
      });
      
      currentY -= 38;

      // Auction Date (compact) - clean special characters
      const cleanAuctionDate = property.AuctionDate.replace(/[^\x00-\x7F]/g, "");
      const maxAuctionLength = 45;
      const auctionDateStr = cleanAuctionDate.length > maxAuctionLength 
        ? cleanAuctionDate.substring(0, maxAuctionLength - 3) + "..." 
        : cleanAuctionDate;
      
      page.drawText(`Auction: ${auctionDateStr}`, {
        x: xPosition + cardPadding,
        y: currentY,
        size: 7,
        font: timesRoman,
        color: rgb(0.4, 0.4, 0.4),
        maxWidth: columnWidth - 2 * cardPadding,
      });
      currentY -= 12;

      // Footer
      page.drawText("www.raahiauction.com", {
        x: xPosition + cardPadding,
        y: currentY,
        size: 6,
        font: timesRomanItalic,
        color: rgb(0.6, 0.6, 0.6),
      });

      // Move to next column or row
      if (currentColumn === 0) {
        currentColumn = 1;
      } else {
        currentColumn = 0;
        yPosition = columnYPosition - cardHeight - 15;
      }
    }

    // Footer on all pages
    const pages = pdfDoc.getPages();
    pages.forEach((pg, idx) => {
      // Footer background
      pg.drawRectangle({
        x: 0,
        y: 0,
        width: pageWidth,
        height: 25,
        color: rgb(0.95, 0.95, 0.95),
      });
      
      pg.drawText("Contact: +91 848 884 8874", {
        x: margin,
        y: 10,
        size: 7,
        font: timesRoman,
        color: rgb(0.4, 0.4, 0.4),
      });
      
      pg.drawText("www.raahiauction.com", {
        x: pageWidth / 2 - 50,
        y: 10,
        size: 7,
        font: timesRomanBold,
        color: rgb(0.086, 0.639, 0.290),
      });
      
      pg.drawText(`Page ${idx + 1} of ${pages.length}`, {
        x: pageWidth - margin - 60,
        y: 10,
        size: 7,
        font: timesRoman,
        color: rgb(0.4, 0.4, 0.4),
      });
    });

    const pdfBytes = await pdfDoc.save();

    return new NextResponse(pdfBytes, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="raahi-auction-daily-${date}.pdf"`,
      },
    });
  } catch (error: any) {
    console.error("Newspaper generation error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to generate newspaper" },
      { status: 500 }
    );
  }
}
