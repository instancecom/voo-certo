/**
 * Utility to "bake" metadata into PNG files following the Open Badges specification.
 * This inserts a 'tEXt' chunk with the keyword 'openbadges'.
 */

// Simple CRC32 implementation for PNG chunks
const crcTable = (() => {
  let c;
  const table = [];
  for (let n = 0; n < 256; n++) {
    c = n;
    for (let k = 0; k < 8; k++) {
      c = ((c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1));
    }
    table[n] = c;
  }
  return table;
})();

function crc32(buffer: Uint8Array): number {
  let crc = 0 ^ (-1);
  for (let i = 0; i < buffer.length; i++) {
    crc = (crc >>> 8) ^ crcTable[(crc ^ buffer[i]) & 0xFF];
  }
  return (crc ^ (-1)) >>> 0;
}

export interface BadgeMetadata {
  recipient: string; // Typically user email or name
  issuedOn: string;  // ISO Date
  badgeId: string;   // Unique ID of the badge
  approvalId: string; // Unique ID of the achievement
  verifyUrl: string; // URL for public verification
  issuerName: string;
  origin: string;
}

/**
 * Injects Open Badges metadata into a PNG Blob.
 */
export async function bakeBadgeMetadata(pngBlob: Blob, metadata: BadgeMetadata): Promise<Blob> {
  const arrayBuffer = await pngBlob.arrayBuffer();
  const originalBuffer = new Uint8Array(arrayBuffer);
  
  // PNG Signature: 89 50 4E 47 0D 0A 1A 0A
  const signature = originalBuffer.slice(0, 8);
  
  // Prepare metadata JSON
  const assertion = {
    "@context": "https://w3id.org/openbadges/v2",
    "type": "Assertion",
    "id": metadata.verifyUrl,
    "recipient": {
      "type": "email",
      "hashed": false,
      "identity": metadata.recipient
    },
    "issuedOn": metadata.issuedOn,
    "badge": {
      "id": `${metadata.origin}/badges/${metadata.badgeId}`,
      "type": "BadgeClass",
      "name": "Insígnia Voo Certo",
      "description": "Certificação de competência técnica em aviação.",
      "image": `${metadata.origin}/badge-image.png`,
      "criteria": {
        "narrative": "Aprovação em simulado padrão ANAC com aproveitamento superior a 70%."
      },
      "issuer": {
        "id": metadata.origin,
        "type": "Issuer",
        "name": metadata.issuerName,
        "url": metadata.origin
      }
    },
    "verification": {
      "type": "hosted",
      "url": metadata.verifyUrl
    },
    "extensions:voocerto": {
      "approvalId": metadata.approvalId
    }
  };

  const jsonString = JSON.stringify(assertion);
  const keyword = "openbadges";
  
  // Create tEXt chunk data: keyword + \0 + text
  const encoder = new TextEncoder();
  const keywordBytes = encoder.encode(keyword);
  const jsonBytes = encoder.encode(jsonString);
  
  const chunkData = new Uint8Array(keywordBytes.length + 1 + jsonBytes.length);
  chunkData.set(keywordBytes);
  chunkData[keywordBytes.length] = 0; // Null separator
  chunkData.set(jsonBytes, keywordBytes.length + 1);
  
  // Create full chunk: Length (4) + Type (4) + Data (N) + CRC (4)
  const chunkType = encoder.encode("tEXt");
  const fullChunk = new Uint8Array(4 + 4 + chunkData.length + 4);
  
  // Length
  const view = new DataView(fullChunk.buffer);
  view.setUint32(0, chunkData.length);
  
  // Type
  fullChunk.set(chunkType, 4);
  
  // Data
  fullChunk.set(chunkData, 8);
  
  // CRC (calculated over Type and Data)
  const crcInput = new Uint8Array(4 + chunkData.length);
  crcInput.set(chunkType);
  crcInput.set(chunkData, 4);
  view.setUint32(8 + chunkData.length, crc32(crcInput));
  
  // Insert chunk after IHDR (usually the first chunk)
  // IHDR is 13 bytes + 4 (length) + 4 (type) + 4 (crc) = 25 bytes total
  // Signature (8) + IHDR (25) = 33
  const head = originalBuffer.slice(0, 33);
  const tail = originalBuffer.slice(33);
  
  const newPngBuffer = new Uint8Array(head.length + fullChunk.length + tail.length);
  newPngBuffer.set(head);
  newPngBuffer.set(fullChunk, head.length);
  newPngBuffer.set(tail, head.length + fullChunk.length);
  
  return new Blob([newPngBuffer], { type: 'image/png' });
}
