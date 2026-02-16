import { useState, useEffect } from "react";
import { useChatStore } from "@/store/chatStore";
import Header from "@/components/Header";
import { ProfileAvatar } from "@/components/ProfileAvatar";
import { ChatButton } from "@/components/ChatButton";
import { useAuth } from "@/app/providers/auth/useAuth";


const Tabs = ({
  tabs,
  currentTab,
  setCurrentTab,
}: {
  tabs: string[];
  currentTab: string;
  setCurrentTab: (tab: string) => void;
}) => (
  <div className="flex gap-4 mb-5">
    {tabs.map((tab) => (
      <ChatButton
        key={tab}
        onClick={() => setCurrentTab(tab)}
        variant={currentTab === tab ? "primary" : "secondary"}
      >
        {tab}
      </ChatButton>
    ))}
  </div>
);

export function ProfilePage() {
  const { update, changePassword, deleteAccount } = useAuth();
  const { users, currentUserId } = useChatStore();
  const user = currentUserId ? users[currentUserId] : null;
  const [currentTab, setCurrentTab] = useState("Личная информация");

  // === USER INFO STATE ===
  const [username, setUsername] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [bio, setBio] = useState("");
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string>("");

  // === CHANGE PASSWORD STATE ===
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [repeatPassword, setRepeatPassword] = useState("");
  const [passwordLoading, setPasswordLoading] = useState(false);

  // === DELETE ACCOUNT STATE ===
  const [deletePassword, setDeletePassword] = useState("");
  const [deleteError, setDeleteError] = useState("");
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (user) {
      queueMicrotask(() => {
        setUsername(user.username || "");
        setFirstName(user.first_name || "");
        setLastName(user.last_name || "");
        setEmail(user.email || "");
        setBio(user.bio || "");
        setAvatarPreview(user.photo_url || "");
        setAvatarFile(null);
      });
    }
  }, [user]);

  if (!user) return <div>Loading...</div>;

  const handleSave = async () => {
    try {
      const sending = {
        id: currentUserId!,
        username,
        first_name: firstName,
        last_name: lastName,
        email,
        bio,
        avatar: avatarFile || null,
      }

      await update(sending);
      alert("Профиль успешно обновлен!");
      setAvatarFile(null); // сброс локального аватара
    } catch (err) {
      console.error(err);
      alert("Ошибка при обновлении профиля");
    }
  };


  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword || !repeatPassword) {
      alert("Заполните все поля");
      return;
    }

    if (newPassword.length < 5) {
      alert("Минимум 5 символов");
      return;
    }

    if (newPassword !== repeatPassword) {
      alert("Пароли не совпадают");
      return;
    }

    try {
      setPasswordLoading(true);
      await changePassword({
        id: currentUserId!,
        currentPassword,
        newPassword,
      });

      alert("Пароль успешно изменён");
      setCurrentPassword("");
      setNewPassword("");
      setRepeatPassword("");
    } catch (err) {
      console.error(err);
      alert(err || "Ошибка смены пароля");
    } finally {
      setPasswordLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!deletePassword.trim()) return;

    const confirmDelete = confirm(
      "Удалить аккаунт навсегда? Это действие необратимо."
    );
    if (!confirmDelete) return;

    try {
      setDeleting(true);
      setDeleteError("");

      await deleteAccount({ id: currentUserId!, password: deletePassword });

      // если дошли сюда — всё ок, редирект
      window.location.href = "/";
    } catch (err: unknown) {
      if (err instanceof Error) {
        setDeleteError(err.message);
      } else {
        setDeleteError("Ошибка удаления");
      }
    } finally {
      setDeleting(false);
    }
  };


  return (
    <div className="layout flex flex-col min-h-screen bg-gray-50 pb-25">
      <Header pageTitle="Мой профиль" />

      <div className="flex-1 p-6 max-w-4xl mx-auto">
        <Tabs
          tabs={["Личная информация", "Безопасность", "Аккаунт"]}
          currentTab={currentTab}
          setCurrentTab={setCurrentTab}
        />

        {currentTab === "Личная информация" && (
          <div className="flex flex-col gap-5">
            <ProfileAvatar
              avatarPreview={avatarPreview}
              onChangeAvatar={(file, preview) => {
                setAvatarFile(file);
                setAvatarPreview(preview);
              }}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <input
                type="text"
                placeholder="Никнейм"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full rounded-lg p-3 text-lg border border-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-400"
              />
              <input
                type="text"
                placeholder="Имя"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="w-full rounded-lg p-3 text-lg border border-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-400"
              />
              <input
                type="text"
                placeholder="Фамилия"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="w-full rounded-lg p-3 text-lg border border-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-400"
              />
              <input
                type="email"
                placeholder="Емail"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-lg p-3 text-lg border border-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-400"
              />
              <textarea
                placeholder="Статус/биография"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                className="w-full rounded-lg p-3 text-lg border border-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-400 md:col-span-2 resize-none"
                rows={4}
              />
            </div>

            <div className="flex justify-center">
              <ChatButton onClick={handleSave} variant="green" className="w-full">
                Сохранить
              </ChatButton>
            </div>
          </div>
        )}

        {currentTab === "Безопасность" && (
          <div className="flex flex-col gap-6 max-w-xl">

            <div className="text-xl font-semibold">
              Смена пароля
            </div>

            <input
              type="password"
              placeholder="Текущий пароль"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="w-full rounded-lg p-3 text-lg border border-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-400"
            />

            <input
              type="password"
              placeholder="Новый пароль"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full rounded-lg p-3 text-lg border border-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-400"
            />

            <input
              type="password"
              placeholder="Повторите новый пароль"
              value={repeatPassword}
              onChange={(e) => setRepeatPassword(e.target.value)}
              className="w-full rounded-lg p-3 text-lg border border-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-400"
            />

            <div className="flex justify-center pt-2">
              <ChatButton
                onClick={handleChangePassword}
                variant="green"
                className="w-full"
              >
                {passwordLoading ? "Смена..." : "Изменить пароль"}
              </ChatButton>
            </div>

          </div>
        )}


        {currentTab === "Аккаунт" && (
          <div className="flex flex-col gap-6">

            <div className="bg-white rounded-xl p-6 shadow-sm border border-red-200">
              <h2 className="text-xl font-semibold text-red-600 mb-4">
                Удаление аккаунта
              </h2>

              <p className="text-gray-500 mb-6">
                Аккаунт удалится навсегда. Сообщения и данные восстановить будет нельзя.
              </p>

              {/* === строка пароль + кнопка === */}
              <div className="flex gap-3 items-center">

                <input
                  type="password"
                  placeholder="Введите пароль"
                  value={deletePassword}
                  onChange={(e) => setDeletePassword(e.target.value)}
                  className="flex-1 rounded-lg p-3 text-lg border border-gray-400 
          focus:outline-none focus:ring-2 focus:ring-gray-400"
                />

                <ChatButton
                  variant="danger"
                  disabled={!deletePassword.trim() || deleting}
                  onClick={handleDeleteAccount}
                  className="whitespace-nowrap"
                >
                  {deleting ? "Удаление..." : "Удалить аккаунт"}
                </ChatButton>

              </div>

              {deleteError && (
                <div className="text-red-500 mt-3 text-sm">
                  {deleteError}
                </div>
              )}

            </div>

          </div>
        )}

      </div>
    </div>
  );
}
