import React from 'react';

const Sidebar = ({ pins, onSelectPin, onDeletePin }) => {
  return (
    <aside className="sidebar p-4 w-[350px]">
      <h2
        className="flex hover:scale-105 transition items-center gap-[4px] sticky top-0 z-10 bg-gradient-to-r p-2"
        style={{ background: 'inherit' }}
      >
        <img src="./pin.png" className="h-[45px] w-[45px]" alt="Pin" />
        <span>Saved Pins</span>
      </h2>
      {pins.length === 0 ? (
        <p className='text-[white] text-[18px]'>No pins saved yet.</p>
      ) : (
        <ul>
          {pins.map((pin, index) => (
            <li
              key={pin._id || pin.id}
              className="flex justify-between items-center cursor-pointer"
            >
              <div onClick={() => onSelectPin(pin._id || pin.id)}>
                <strong>{index + 1}.</strong>
                <span className="ml-1">
                  <strong>Remark:</strong> {pin.remark || 'No remark'}
                  <br />
                  <strong>Address:</strong> {pin.address || 'No address'}
                </span>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDeletePin(pin._id || pin.id);
                }}
                className="ml-[5px]"
                title="Delete Pin"
              >
                Delete
              </button>
            </li>
          ))}
        </ul>
      )}
    </aside>
  );
};

export default Sidebar;

//////