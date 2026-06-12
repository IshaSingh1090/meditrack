import { useEffect, useRef } from 'react';
import Quagga from 'quagga';

const BarcodeScanner = ({ onDetected, onClose }) => {
  const scannerRef = useRef(null);

  useEffect(() => {
    Quagga.init({
      inputStream: {
        type: 'LiveStream',
        target: scannerRef.current,
        constraints: { facingMode: 'environment' }
      },
      decoder: {
        readers: ['ean_reader', 'code_128_reader', 'upc_reader']
      }
    }, (err) => {
      if (err) { console.error(err); return; }
      Quagga.start();
    });

    Quagga.onDetected((result) => {
      const code = result.codeResult.code;
      onDetected(code);
      Quagga.stop();
      onClose();
    });

    return () => Quagga.stop();
  }, []);

  return (
    <div style={styles.overlay}>
      <div style={styles.modal}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h3 style={{ margin: 0 }}>📷 Scan Barcode</h3>
          <button onClick={() => { Quagga.stop(); onClose(); }}
            style={{ padding: '0.5rem 1rem', backgroundColor: '#ef4444', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>
            ✕ Close
          </button>
        </div>
        <div ref={scannerRef} style={styles.scanner} />
        <p style={{ textAlign: 'center', color: '#64748b', marginTop: '1rem' }}>
          Point your camera at a barcode
        </p>
      </div>
    </div>
  );
};

const styles = {
  overlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.7)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 },
  modal: { backgroundColor: 'white', padding: '1.5rem', borderRadius: '12px', width: '90%', maxWidth: '500px' },
  scanner: { width: '100%', height: '300px', overflow: 'hidden', borderRadius: '8px', backgroundColor: '#000' }
};

export default BarcodeScanner;