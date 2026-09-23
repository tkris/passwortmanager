// crypto.js - Client-seitige Verschlüsselung mit Web Crypto API
(function() {
  'use strict';

  const PBKDF2_ITERATIONS = 600000;
  const SALT_LENGTH = 16;
  const IV_LENGTH = 12;

  // Hilfsfunktion: Wandelt das rohe Passwort in ein von der Web Crypto API lesbares Schlüsselobjekt um
  async function importPasswordKey(passwordBytes) {
    return await window.crypto.subtle.importKey(
      'raw',
      passwordBytes,
      'PBKDF2',
      false,
      ['deriveKey']
    );
  }

  async function deriveKey(masterPassword, salt) {
    const encoder = new TextEncoder();
    const passwordBytes = encoder.encode(masterPassword);
    const saltBytes = hexToUint8Array(salt);

    // Erst das Passwort importieren, dann den echten AES-GCM Schlüssel ableiten
    const baseKey = await importPasswordKey(passwordBytes);

    return await window.crypto.subtle.deriveKey(
      {
        name: 'PBKDF2',
        hash: 'SHA-256',
        salt: saltBytes,
        iterations: PBKDF2_ITERATIONS
      },
      baseKey,
      {
        name: 'AES-GCM',
        length: 256
      },
      false,
      ['encrypt', 'decrypt']
    );
  }

  async function encryptData(plainText, masterPassword) {
    const salt = randomBytesToHex(SALT_LENGTH);
    const key = await deriveKey(masterPassword, salt);

    const iv = window.crypto.getRandomValues(new Uint8Array(IV_LENGTH));
    const ivHex = bytesToHex(iv);

    const encryptedData = await window.crypto.subtle.encrypt(
      {
        name: 'AES-GCM',
        iv: iv
      },
      key,
      new TextEncoder().encode(plainText)
    );

    const ciphertextBase64 = uint8ArrayToBase64(new Uint8Array(encryptedData));

    return {
      ciphertext: ciphertextBase64,
      iv: ivHex,
      salt: salt
    };
  }

  async function decryptData(encryptedObject, masterPassword) {
    const { ciphertext, iv, salt } = encryptedObject;

    const key = await deriveKey(masterPassword, salt);
    const ivBytes = hexToUint8Array(iv);

    try {
      const decryptedData = await window.crypto.subtle.decrypt(
        {
          name: 'AES-GCM',
          iv: ivBytes
        },
        key,
        base64ToUint8Array(ciphertext)
      );

      return new TextDecoder().decode(decryptedData);
    } catch (error) {
      throw new Error('Falsches Passwort oder beschädigte Daten');
    }
  }

  // Hilfsfunktionen für Hex und Base64 Konvertierungen
  function hexToUint8Array(hex) {
    const bytes = new Uint8Array(hex.length / 2);
    for (let i = 0; i < hex.length; i += 2) {
      bytes[i / 2] = parseInt(hex.substr(i, 2), 16);
    }
    return bytes;
  }

  function bytesToHex(bytes) {
    let result = '';
    for (let i = 0; i < bytes.length; i++) {
      result += bytes[i].toString(16).padStart(2, '0');
    }
    return result;
  }

  function randomBytesToHex(length) {
    const bytes = window.crypto.getRandomValues(new Uint8Array(length));
    return bytesToHex(bytes);
  }

  // Wichtig für Safaris und ältere Browser: Saubere Konvertierung
  function uint8ArrayToBase64(uint8Array) {
    let binary = '';
    for (let i = 0; i < uint8Array.byteLength; i++) {
      binary += String.fromCharCode(uint8Array[i]);
    }
    return btoa(binary);
  }

  function base64ToUint8Array(base64) {
    const binaryString = atob(base64);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes;
  }

  // DIE RETTUNG: Wir hängen die Kernfunktionen an das globale Fenster-Objekt an,
  // damit Ihre anderen Dateien (app.js) darauf zugreifen können!
  window.PasswordCrypto = {
    encrypt: encryptData,
    decrypt: decryptData
  };

})();
