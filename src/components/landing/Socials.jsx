import { FaVk, FaInstagram, FaTelegramPlane } from "react-icons/fa";

export default function Socials() {
  return (
    <>
      <p className="socialSubtitle">Остались вопросы? Напишите мне</p>

      <div className="socials">
        <a
          className="socialButton"
          href="https://vk.com/stubborn_ram"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="VK"
        >
          <FaVk />
        </a>

        <a
          className="socialButton"
          href="https://www.instagram.com/egor_baal?igsh=N29mZm54OW00bHpi&utm_source=qr"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Instagram"
        >
          <FaInstagram />
        </a>

        <a
          className="socialButton"
          href="https://t.me/stubborn_ram"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Telegram"
        >
          <FaTelegramPlane />
        </a>
      </div>
    </>
  );
}
