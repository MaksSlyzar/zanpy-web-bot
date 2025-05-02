import React, { useState, useEffect, useRef } from "react";
import { useDrag, useDrop } from "react-dnd";
import "./RaidCreate.css";
import CommandBox from "./CommandBox";
import { v4 as uuidv4 } from "uuid";

//const serverUrl = "https://zanpy-discord-bot.onrender.com";
const serverUrl = "http://localhost:10000";

interface Weapon {
  imageUrl: string;
  description: string;
  name: string;
  id: string;
  uniqueId: string;
}

const RaidCreate: React.FC = () => {
  const commandRef = useRef<HTMLDivElement | null>(null);
  const [weapons, setWeapons] = useState<Array<Weapon>>([]);
  const [selectedWeapons, setSelectedWeapons] = useState<Array<Weapon>>([]);
  const [raidName, setRaidName] = useState<string>("");
  const [raidStartTime, setRaidStartTime] = useState<string>("");
  const [weaponEquivalent, setWeaponEquivalent] = useState<string>("");

  useEffect(() => {
    fetch(serverUrl + "/api/get-emojies")
      .then((res) => res.json())
      .then((data) => {
        const weaponsWithUniqueIds = data.items.map((weapon: Weapon) => ({
          ...weapon,
          uniqueId: uuidv4(),
        }));
        setWeapons(weaponsWithUniqueIds);
      });
  }, []);

  const handleDrop = (item: Weapon) => {
    if (!selectedWeapons.find((weapon) => weapon.id === item.id)) {
      setSelectedWeapons((prev) => [...prev, { ...item, uniqueId: uuidv4() }]);
    }
  };

  const handleGenerateRaid = () => {
    console.log("Назва рейду:", raidName);
    console.log("Час початку рейду:", raidStartTime);
    console.log("Еквівалент зброї:", weaponEquivalent);
    console.log("Обрані пушки:", selectedWeapons);

    setTimeout(() => {
      commandRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  };

  const removeWeapon = (uniqueId: string) => {
    setSelectedWeapons((prev) =>
      prev.filter((weapon) => weapon.uniqueId !== uniqueId)
    );
  };

  const dropRef = useRef<HTMLDivElement | null>(null);
  const [, drop] = useDrop(() => ({
    accept: "weapon",
    drop: (item: Weapon) => handleDrop(item),
  }));

  useEffect(() => {
    if (dropRef.current) {
      drop(dropRef);
    }
  }, [drop]);

  return (
    <div className="container">
      <div className="raid-form">
        <div className="form-group">
          <label htmlFor="raid-name">Назва рейду:</label>
          <input
            type="text"
            id="raid-name"
            value={raidName}
            onChange={(e) => setRaidName(e.target.value)}
            className="form-input"
          />
        </div>
        <div className="form-group">
          <label htmlFor="raid-time">Час початку рейду:</label>
          <input
            type="text"
            id="raid-time"
            value={raidStartTime}
            onChange={(e) => setRaidStartTime(e.target.value)}
            className="form-input"
          />
        </div>
        <div className="form-group">
          <label htmlFor="weapon-equivalent">Еквівалент зброї:</label>
          <input
            type="text"
            id="weapon-equivalent"
            value={weaponEquivalent}
            onChange={(e) => setWeaponEquivalent(e.target.value)}
            className="form-input"
          />
        </div>
        <button onClick={handleGenerateRaid} className="generate-btn">
          Згенерувати рейд
        </button>
      </div>

      <div className="wrapper">
        <div className="weapons-list">
          <h3>Список пушок</h3>
          <div>
            {weapons.map((weapon) => (
              <WeaponItem key={weapon.uniqueId} weapon={weapon} />
            ))}
          </div>
        </div>

        <div ref={dropRef} className="selected-weapons">
          <h3>Обрані пушки</h3>
          <div>
            {selectedWeapons.map((weapon) => (
              <div key={weapon.uniqueId} className="weapon-item">
                <img
                  src={serverUrl + weapon.imageUrl}
                  alt={weapon.name}
                  className="weapon-img"
                />
                <span>{weapon.name}</span>
                <button
                  onClick={() => removeWeapon(weapon.uniqueId)}
                  className="remove-btn"
                >
                  ✖️
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="command-block" ref={commandRef}>
        <h2>Згенерована команда для Discord</h2>
        <p>Скопіюйте команду нижче та вставте її в канал, де активний бот.</p>
        <CommandBox
          raidStartTime={raidStartTime}
          weaponEquivalent={weaponEquivalent}
          selectedWeapons={selectedWeapons}
          raidName={raidName}
        />
      </div>
    </div>
  );
};

const WeaponItem: React.FC<{ weapon: Weapon }> = ({ weapon }) => {
  const dragRef = useRef<HTMLDivElement | null>(null);
  const [{ isDragging }, drag] = useDrag(() => ({
    type: "weapon",
    item: weapon,
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  }));

  useEffect(() => {
    if (dragRef.current) {
      drag(dragRef);
    }
  }, [drag]);

  return (
    <div
      ref={dragRef}
      className="weapon-item"
      style={{ cursor: "move", opacity: isDragging ? 0.5 : 1 }}
    >
      <img
        src={serverUrl + weapon.imageUrl}
        alt={weapon.name}
        className="weapon-img"
      />
      <span>{weapon.name}</span>
    </div>
  );
};

export default RaidCreate;

