import { jsPDF } from 'jspdf';
import { TentConfiguration, PricingBreakdown } from '../types/configurator';
import { TENT_SIZES, FRAME_FINISHES } from './constants';

export async function generateConfigurationPDF(
  config: TentConfiguration,
  pricing: PricingBreakdown,
  canvasSnapshot?: string
) {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 18;
  const contentWidth = pageWidth - margin * 2;
  let y = margin;

  // Header Banner
  doc.setFillColor(15, 23, 42); // Charcoal Slate 900
  doc.rect(0, 0, pageWidth, 28, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.text('3D TENT PRODUCT CONFIGURATION & QUOTATION', margin, 14);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(148, 163, 184); // Slate 400
  const orderRef = `SPEC-${Date.now().toString().slice(-6)}`;
  doc.text(`Reference: ${orderRef}  |  Generated: ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}`, margin, 21);

  y = 36;

  // Optional 3D Viewport Snapshot / Render
  if (canvasSnapshot) {
    try {
      const imgWidth = 75;
      const imgHeight = 45;
      doc.addImage(canvasSnapshot, 'JPEG', pageWidth - margin - imgWidth, y, imgWidth, imgHeight);
    } catch (e) {
      console.warn('Could not embed 3D snapshot in PDF:', e);
    }
  }

  // Section 1: Product Specifications
  doc.setTextColor(15, 23, 42);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.text('1. Product Specifications', margin, y);
  y += 6;

  const selectedSize = TENT_SIZES.find(s => s.id === config.size) || TENT_SIZES[0];
  const selectedFrame = FRAME_FINISHES.find(f => f.id === config.frameFinish) || FRAME_FINISHES[0];

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(51, 65, 85);

  const specRows = [
    ['Model Type:', 'Commercial Heavy-Duty Pop-Up Canopy Tent'],
    ['Footprint Size:', `${selectedSize.label} (${selectedSize.dimensions})`],
    ['Roof Canopy Color:', `${config.roofColorName} (${config.roofColor})`],
    ['Valance Border:', config.matchValanceColor ? 'Matches Canopy Roof' : `Custom (${config.valanceColor})`],
    ['Hardware Frame:', `${selectedFrame.name} - Aircraft Grade Rust-Proof Tubing`],
  ];

  specRows.forEach(([label, val]) => {
    doc.setFont('helvetica', 'bold');
    doc.text(label, margin, y);
    doc.setFont('helvetica', 'normal');
    doc.text(val, margin + 40, y);
    y += 5;
  });

  y += 4;

  // Section 2: Modular Sidewall Configuration
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(15, 23, 42);
  doc.text('2. Sidewall & Enclosure Configuration', margin, y);
  y += 6;

  const wallSides = [
    { name: 'Back Wall', cfg: config.walls.back },
    { name: 'Left Wall', cfg: config.walls.left },
    { name: 'Right Wall', cfg: config.walls.right },
    { name: 'Front Wall', cfg: config.walls.front },
  ];

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(51, 65, 85);

  wallSides.forEach(w => {
    const status = w.cfg.enabled
      ? `Installed [Style: ${w.cfg.style.toUpperCase()}, Color: ${w.cfg.color}]`
      : 'Open (No Sidewall Panel)';
    doc.setFont('helvetica', 'bold');
    doc.text(`• ${w.name}:`, margin + 2, y);
    doc.setFont('helvetica', 'normal');
    doc.text(status, margin + 35, y);
    y += 5;
  });

  y += 4;

  // Section 3: Custom Graphics & Branding Summary
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(15, 23, 42);
  doc.text('3. Custom Print & Branding Specification', margin, y);
  y += 6;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(51, 65, 85);

  let hasPrints = false;
  Object.entries(config.surfaceDesigns).forEach(([surface, elements]) => {
    if (elements.length > 0) {
      hasPrints = true;
      doc.setFont('helvetica', 'bold');
      doc.text(`[${surface.toUpperCase()}]`, margin + 2, y);
      y += 4.5;
      elements.forEach((el, idx) => {
        if (el.type === 'logo') {
          doc.setFont('helvetica', 'normal');
          doc.text(`  ${idx + 1}. Uploaded Graphic Logo: "${el.name}" (Scale: ${Math.round(el.scale * 100)}%, Pos: ${Math.round(el.x)}%, ${Math.round(el.y)}%)`, margin + 4, y);
        } else {
          doc.setFont('helvetica', 'normal');
          doc.text(`  ${idx + 1}. Custom Slogan: "${el.text}" (Font: ${el.fontFamily}, Size: ${el.fontSize}pt, Color: ${el.color})`, margin + 4, y);
        }
        y += 4.5;
      });
    }
  });

  if (!hasPrints) {
    doc.text('No custom graphics applied (Standard blank unprinted canopy).', margin + 2, y);
    y += 5;
  }

  y += 4;

  // Section 4: Accessories
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(15, 23, 42);
  doc.text('4. Accessories & Hardware Inclusions', margin, y);
  y += 6;

  const accItems = [];
  if (config.accessories.weightPlates) accItems.push('Cast-Iron 28lb Weight Ballast Plates (4-Pack)');
  if (config.accessories.wheeledRollerBag) accItems.push('All-Terrain Heavy-Duty Roller Transport Bag');
  if (config.accessories.heavyDutyStakeKit) accItems.push('Steel Auger Stake & Cam-Lock Guy Rope Tie-Downs');
  if (config.accessories.ledTentLightSystem) accItems.push('Ultra-Bright Clip-On LED Truss Light System');
  if (accItems.length === 0) accItems.push('Standard Base Package (No optional accessories)');

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(51, 65, 85);
  accItems.forEach(item => {
    doc.text(`• ${item}`, margin + 2, y);
    y += 5;
  });

  y += 6;

  // Section 5: Quotation & Line Items Table
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(15, 23, 42);
  doc.text('5. Itemized Quotation & Price Breakdown', margin, y);
  y += 5;

  // Table header
  doc.setFillColor(241, 245, 249);
  doc.rect(margin, y, contentWidth, 7, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(30, 41, 59);
  doc.text('Item Description', margin + 3, y + 4.8);
  doc.text('Amount (INR)', margin + contentWidth - 32, y + 4.8);
  y += 8;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(51, 65, 85);

  pricing.lineItems.forEach((item, i) => {
    if (i % 2 === 1) {
      doc.setFillColor(248, 250, 252);
      doc.rect(margin, y - 0.8, contentWidth, 5.5, 'F');
    }
    doc.text(item.name, margin + 3, y + 3.2);
    doc.text(`INR ${item.amount.toLocaleString('en-IN')}`, margin + contentWidth - 32, y + 3.2);
    y += 5.5;
  });

  // Divider
  doc.setDrawColor(203, 213, 225);
  doc.line(margin, y + 1, margin + contentWidth, y + 1);
  y += 4;

  // Subtotal, Tax, and Total Summary
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.text('Subtotal:', margin + contentWidth - 65, y + 3);
  doc.text(`INR ${pricing.subtotal.toLocaleString('en-IN')}`, margin + contentWidth - 32, y + 3);
  y += 5;

  doc.text('Estimated GST (18%):', margin + contentWidth - 65, y + 3);
  doc.text(`INR ${pricing.estimatedTax.toLocaleString('en-IN')}`, margin + contentWidth - 32, y + 3);
  y += 6;

  // Total Box
  doc.setFillColor(238, 242, 255); // Indigo light
  doc.rect(margin + contentWidth - 80, y - 1, 80, 8, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(30, 58, 138); // Blue 900
  doc.text('Total Quotation:', margin + contentWidth - 77, y + 4.5);
  doc.text(`INR ${pricing.total.toLocaleString('en-IN')}`, margin + contentWidth - 32, y + 4.5);

  // Footer
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(148, 163, 184);
  doc.text(
    'This technical quotation was automatically generated by the 3D Interactive Tent Product Configurator. Valid for 30 days.',
    margin,
    pageHeight - 10
  );

  // Download PDF
  const filename = `Tent_Configuration_Quotation_${orderRef}.pdf`;
  doc.save(filename);
  return filename;
}

