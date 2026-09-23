
(function () {
  'use strict';

  const ITERATIONS = 600000;
  const enc = new TextEncoder();
  const dec = new TextDecoder('utf-8', { fatal: true });

  const hex = bytes =>
  Array.from(bytes, b =>
  b.toString(16).padStart(2, '0')
  ).join('');

  function unhex(value, length) {
    if (
      typeof value !== 'string' ||
      value.length !== length * 2 ||
      !/^[0-9a-f]+$/i.test(value)
    ) {
      throw new Error('Ungültige Tresordaten');
    }

    return Uint8Array.from(
      value.match(/../g),
                           part => parseInt(part, 16)
    );
  }

  function unbase64(value) {
    if (
      typeof value !== 'string' ||
      !/^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/.test(value)
    ) {
      throw new Error('Ungültige Tresordaten');
    }

    return Uint8Array.from(
      atob(value),
                           c => c.charCodeAt(0)
    );
  }

  function base64(bytes) {
    let str = '';

    for (const b of bytes) {
      str += String.fromCharCode(b);
    }

    return btoa(str);
  }

  // Master-Passwort in einen nicht exportierbaren
  // AES-256-GCM-Schlüssel umwandeln.
  async function derive(password, salt) {
    const bytes = enc.encode(password);

    try {
      const material = await crypto.subtle.importKey(
        'raw',
        bytes,
        'PBKDF2',
        false,
        ['deriveKey']
      );

      return await crypto.subtle.deriveKey(
        {
          name: 'PBKDF2',
          salt: unhex(salt, 16),
                                           iterations: ITERATIONS,
                                           hash: 'SHA-256'
        },
        material,
        {
          name: 'AES-GCM',
          length: 256
        },
        false,
        ['encrypt', 'decrypt']
      );
    } finally {
      bytes.fill(0);
    }
  }

  // Verschlüsselte Tresordaten überprüfen.
  function validate(object) {
    if (
      !object ||
      typeof object !== 'object' ||
      Array.isArray(object)
    ) {
      throw new Error('Ungültiger Tresor');
    }

    if (
      object.version !== undefined &&
      object.version !== 2
    ) {
      throw new Error(
        'Nicht unterstützte Tresorversion'
      );
    }

    if (
      object.version === 2 &&
      (
        object.kdf !== 'PBKDF2-SHA256' ||
        object.iterations !== ITERATIONS ||
        object.cipher !== 'AES-256-GCM'
      )
    ) {
      throw new Error(
        'Nicht unterstützte Verschlüsselung'
      );
    }

    unhex(object.salt, 16);
    unhex(object.iv, 12);

    if (unbase64(object.ciphertext).length < 16) {
      throw new Error('Ungültiger Ciphertext');
    }
  }

  // Tresor mit einem vorhandenen CryptoKey entschlüsseln.
  async function decryptWithKey(object, key) {
    validate(object);

    const bytes = await crypto.subtle.decrypt(
      {
        name: 'AES-GCM',
        iv: unhex(object.iv, 12)
      },
      key,
      unbase64(object.ciphertext)
    );

    return dec.decode(bytes);
  }

  // Vorhandenen Tresor mit dem Master-Passwort öffnen.
  async function open(object, password) {
    validate(object);

    const key = await derive(
      password,
      object.salt
    );

    const plaintext = await decryptWithKey(
      object,
      key
    );

    return {
      key,
      salt: object.salt,
      plaintext
    };
  }

  // Neuen Tresor und Sitzungsschlüssel erstellen.
  async function create(password) {
    const salt = hex(
      crypto.getRandomValues(
        new Uint8Array(16)
      )
    );

    return {
      key: await derive(password, salt),
 salt
    };
  }

  // Tresor mit dem vorhandenen Sitzungsschlüssel
  // verschlüsseln. Das Master-Passwort wird
  // dafür nicht erneut benötigt.
  async function encrypt(plaintext, key, salt) {
    unhex(salt, 16);

    if (
      !(key instanceof CryptoKey) ||
      key.extractable ||
      key.algorithm.name !== 'AES-GCM'
    ) {
      throw new Error(
        'Ungültiger Sitzungsschlüssel'
      );
    }

    // Bei jeder Verschlüsselung einen neuen IV erzeugen.
    const iv = crypto.getRandomValues(
      new Uint8Array(12)
    );

    const encrypted = await crypto.subtle.encrypt(
      {
        name: 'AES-GCM',
        iv
      },
      key,
      enc.encode(plaintext)
    );

    // Versioniertes Tresorformat.
    return {
      version: 2,
      kdf: 'PBKDF2-SHA256',
      iterations: ITERATIONS,
      cipher: 'AES-256-GCM',
      salt,
      iv: hex(iv),
 ciphertext: base64(
   new Uint8Array(encrypted)
 )
    };
  }

  // Öffentliche Funktionen für index_neu.html.
  window.PasswordCrypto = Object.freeze({
    open,
    create,
    encrypt
  });

})();
