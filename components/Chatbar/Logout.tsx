import { IconCheck, IconLogout, IconX } from '@tabler/icons-react';
import { useTranslation } from 'next-i18next';
import { FC, useState } from 'react';
import { SidebarButton } from '../Sidebar/SidebarButton';

interface Props {
  onLogout: () => void;
}

export const Logout: FC<Props> = ({ onLogout }) => {
  const [isConfirming, setIsConfirming] = useState<boolean>(false);

  const { t } = useTranslation('sidebar');

  const handleLogout = () => {
    onLogout();
    setIsConfirming(false);
  };

  return isConfirming ? (
    <div className="flex w-full cursor-pointer items-center rounded-lg py-3 px-3 hover:bg-gray-500/10">
      <IconLogout size={18} />

      <div className="ml-3 flex-1 text-left text-[12.5px] leading-3 text-white">
        {t('Are you sure?')}
      </div>

      <div className="flex w-[40px]">
        <IconCheck
          className="ml-auto min-w-[20px] mr-1 text-neutral-400 hover:text-neutral-100"
          size={18}
          onClick={(e) => {
            e.stopPropagation();
            handleLogout();
          }}
        />

        <IconX
          className="ml-auto min-w-[20px] text-neutral-400 hover:text-neutral-100"
          size={18}
          onClick={(e) => {
            e.stopPropagation();
            setIsConfirming(false);
          }}
        />
      </div>
    </div>
  ) : (
    <SidebarButton
      text={t('Log out')}
      icon={<IconLogout size={18} />}
      onClick={() => setIsConfirming(true)}
    />
  );
};
