import React, { useEffect, useState } from "react";
import "./AlbionIconsForm.css";

type AlbionIcon = {
  id: string;
  emojiFile?: File;
  emojiPreview?: string;
  names: string[];
  description: string;
};

type AlbionIconServer = {
  id: string;
  emojiPreview: string;
  names: string[];
  description: string;
};

const serverUrl = "http://localhost:10000";

const AlbionIconsForm: React.FC = () => {
  const [icons, setIcons] = useState<AlbionIcon[]>([]);
  const [registeredIcons, setRegisteredIcons] = useState<AlbionIconServer[]>([]);
  const [testingIcons, setTestingIcons] = useState<AlbionIconServer[]>([]);

  const [newIcon, setNewIcon] = useState<AlbionIcon>({
    id: "",
    names: [""],
    description: "",
  });

  useEffect(() => {
    fetch(serverUrl + "/api/get-emojies")
      .then(res => res.json())
      .then(data => {
        const items = data.items.map((item: any) => ({
          id: item.id,
          description: item.description,
          emojiPreview: serverUrl + "/albion-icons/" + item.id + ".png",
          names: item.names,
        }));

        const unitems = data.test.map((item: any) => ({
          id: item.id,
          description: item.description,
          emojiPreview: serverUrl + "/test-items/" + item.id + ".png",
          names: item.names,
        }));

        setRegisteredIcons(items);
        setTestingIcons(unitems);
      });
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    field: keyof AlbionIcon
  ) => {
    setNewIcon({ ...newIcon, [field]: e.target.value });
  };

  const handleNamesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewIcon({
      ...newIcon,
      names: e.target.value.split(","),
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const preview = URL.createObjectURL(file);
      setNewIcon({ ...newIcon, emojiFile: file, emojiPreview: preview });
    }
  };

  const handleAdd = async () => {
    if (!newIcon.id.trim() || !newIcon.emojiFile) {
      alert("ID і зображення обов'язкові");
      return;
    }

    setIcons([...icons, newIcon]);
    setNewIcon({ id: "", names: [""], description: "" });

    const formData = new FormData();
    formData.append("image", newIcon.emojiFile);
    formData.append(
      "data",
      JSON.stringify({
        id: newIcon.id,
        names: newIcon.names,
        description: newIcon.description,
      })
    );

    try {
      const response = await fetch(serverUrl + "/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Помилка завантаження на сервер");
      }

      console.log("Іконка успішно завантажена!");
    } catch (error) {
      console.error("Помилка відправки:", error);
    }
  };

  const handleDelete = (id: string) => {
    setIcons(icons.filter(icon => icon.id !== id));
  };

  const renderIconList = (
    list: (AlbionIcon | AlbionIconServer)[],
    allowDelete = false
  ) => (
    <ul className="icon-list">
      {list.map(icon => (
        <li key={icon.id} className="icon-item">
          <div className="icon-info">
            {icon.emojiPreview && (
              <img src={icon.emojiPreview} alt={icon.id} className="emoji-image" />
            )}
            <div className="icon-text">
              <div><strong>ID:</strong> {icon.id}</div>
              <div><strong>Назви:</strong> {icon.names.join(",")}</div>
              <div><strong>Опис:</strong> {icon.description}</div>
            </div>
          </div>
          {allowDelete && (
            <button className="delete-btn" onClick={() => handleDelete(icon.id)}>
              Видалити
            </button>
          )}
        </li>
      ))}
    </ul>
  );

  return (
    <div className="albion-form">
      <h2>Додати нову іконку</h2>
      <div className="input-group">
        <input
          type="text"
          placeholder="ID"
          value={newIcon.id}
          onChange={e => handleChange(e, "id")}
        />
        <input
          type="text"
          placeholder="Назви (через кому)"
          value={newIcon.names.join(",")}
          onChange={handleNamesChange}
        />
        <textarea
          placeholder="Опис"
          value={newIcon.description}
          onChange={e => handleChange(e, "description")}
        />
        <input type="file" accept="image/*" onChange={handleFileChange} />
        {newIcon.emojiPreview && (
          <img src={newIcon.emojiPreview} alt="Прев'ю емодзі" className="emoji-preview" />
        )}
        <button className="add-btn" onClick={handleAdd}>
          Додати
        </button>
      </div>

      <h2>Список нових іконок</h2>
      {renderIconList(icons, true)}

      <h2>Зареєстровані іконки</h2>
      {renderIconList(registeredIcons)}

      <h2>Не зареєстровані іконки</h2>
      {renderIconList(testingIcons)}
    </div>
  );
};

export default AlbionIconsForm;

