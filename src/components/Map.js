import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';


delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.3/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.3/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.3/dist/images/marker-shadow.png',
});

const Map = ({ pins, onAddPin, onSelectPin, selectedPinId }) => {
  const [newPin, setNewPin] = useState(null);
  const [remark, setRemark] = useState('');
  const [address, setAddress] = useState('');
  const [error, setError] = useState('');
  const mapRef = useRef();

  // Function to fetch address from reverse-geocode API
  const fetchAddress = async (lat, lon) => {
    try {
      const response = await fetch(`/api/reverse-geocode?lat=${lat}&lon=${lon}`);
      if (!response.ok) {
        throw new Error('Failed to fetch address');
      }
      const data = await response.json();
      return data.display_name || '';
    } catch (err) {
      console.error('Error fetching address:', err);
      return '';
    }
  };

  const MapClickHandler = () => {
    useMapEvents({
      click: async (e) => {
        const lat = e.latlng.lat;
        const lng = e.latlng.lng;
        const fetchedAddress = await fetchAddress(lat, lng);
        setNewPin({
          id: Date.now(),
          lat,
          lng,
          remark: '',
          address: fetchedAddress,
        });
        setRemark('');
        setAddress(fetchedAddress);
        setError('');
      },
    });
    return null;
  };

  useEffect(() => {
    if (selectedPinId && mapRef.current) {
      const pin = pins.find((p) => p._id === selectedPinId || p.id === selectedPinId);
      if (pin) {
        mapRef.current.setView([pin.lat, pin.lng], 13);
      }
    }
  }, [selectedPinId, pins]);

  const handleSavePin = async () => {
    if (newPin) {
      try {
        const response = await fetch('/api/pins', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            lat: newPin.lat,
            lng: newPin.lng,
            remark: remark.trim(),
            address,
          }),
        });
        if (!response.ok) {
          throw new Error('Failed to save pin');
        }
        const savedPin = await response.json();
        onAddPin(savedPin);
        const storedPins = JSON.parse(localStorage.getItem('pins') || '[]');
        localStorage.setItem('pins', JSON.stringify([...storedPins, savedPin]));
        setNewPin(null);
        setRemark('');
        setAddress('');
        setError('');
      } catch (error) {
        console.error('Error saving pin:', error);
        setError('Failed to save pin. Please try again.');
      }
    }
  };

  return (
    <div className="h-full w-full">
      <MapContainer
        center={[51.505, -0.09]}
        zoom={13}
        style={{ height: '100%', width: '100%' }}
        whenCreated={(mapInstance) => {
          mapRef.current = mapInstance;
        }}
    >
      <TileLayer
        attribution='&copy; <a href="https://osm.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      <MapClickHandler />

      {pins.map((pin) => (
        <Marker
          key={pin._id || pin.id}
          position={[pin.lat, pin.lng]}
          eventHandlers={{
            click: () => onSelectPin(pin._id || pin.id),
          }}
        >
          <Popup>
            <div>
              <strong>Remark:</strong> {pin.remark || 'No remark'}<br />
              <strong>Address:</strong> {pin.address || 'No address'}
            </div>
          </Popup>
        </Marker>
      ))}

      {newPin && (
        <Marker
          key={newPin.id}
          position={[newPin.lat, newPin.lng]}
          eventHandlers={{
            add: (e) => {
              // Open popup manually on marker add
              setTimeout(() => e.target.openPopup(), 0);
            },
          }}
        >
          <Popup
            closeOnClick={false}
            closeOnEscapeKey={false}
            autoClose={false}
            closeButton={true}
            keepInView={true}
          >
            <div className="w-[200px]">
              <label htmlFor="remark">Remark:</label>
              <input
                id="remark"
                type="text"
                value={remark}
                onChange={(e) => setRemark(e.target.value)}
                className="border p-1 w-full mt-1 mb-2 rounded"
              />
              {error && <p className="text-red-600">{error}</p>}
              <div className="flex justify-end gap-6 mt-2">
                <button
                  onClick={handleSavePin}
                  className="mr-[10px]"
                >
                  Save
                </button>
                <button
                  onClick={() => {
                    console.log('Cancel button clicked');
                    setNewPin(null);
                    setRemark('');
                    setAddress('');
                    setError('');
                  }}
                >
                  Cancel
                </button>
              </div>
            </div>
          </Popup>
        </Marker>
      )}
      </MapContainer>
    </div>
  );
};

export default Map;

/////