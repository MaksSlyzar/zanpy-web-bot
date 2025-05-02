import { useState, useCallback } from 'react';
import './CommandBox.css'; // або стилі нижче в global CSS
interface Weapon {
  imageUrl: string;
  description: string;
  name: string;
  id: string;
}


type CommandParams = {
  raidName: string;
  raidStartTime: string;
  weaponEquivalent: string;
  selectedWeapons: Weapon[];
}

const CommandBox = ({ raidName, raidStartTime, weaponEquivalent, selectedWeapons }: CommandParams) => {
  const [copied, setCopied] = useState(false);

  const command = `!create-raid;${raidName};${raidStartTime};${weaponEquivalent};${selectedWeapons.map(w => w.id).join('%')}`;

  const copyToClipboard = useCallback(() => {
    navigator.clipboard.writeText(command).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }, [command]);

  return (
    <div className="generated-command" onClick={copyToClipboard}>
      <code>{command}</code>
      <span className={`copied-message ${copied ? 'visible' : ''}`}>Скопійовано!</span>
    </div>
  );
};

export default CommandBox;

