import { FiCopy, FiCheck, FiBriefcase, FiFileText, FiMapPin, FiCreditCard } from 'react-icons/fi';
import { useState, useCallback } from 'react';
import styles from './LegalEntityPage.module.css';

const LegalEntityPage = () => {
  const [copiedField, setCopiedField] = useState(null);

  const legalInfo = {
    name: 'ООО Интернет технологии',
    inn: '1234 4321 1015',
    ogrnip: '23178 92781 47121',
    address: 'Москва, Мавзолей',
    bank: {
      name: 'ФИЛИАЛ "АДА" АО "СберМусор" г. Санкт-Петербург',
      bik: '123456778',
      correspondentAccount: '3010 1234 0229 0000 1839',
      settlementAccount: '4812 2110 3822 9862 9192',
    },
  };

  const handleCopy = useCallback((text, fieldName) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedField(fieldName);
      setTimeout(() => setCopiedField(null), 2000);
    });
  }, []);

  const CopyButton = ({ text, fieldName }) => (
    <button
      className={styles.copyButton}
      onClick={() => handleCopy(text, fieldName)}
      type="button"
    >
      {copiedField === fieldName ? (
        <>
          <FiCheck size={16} />
          <span>Скопировано</span>
        </>
      ) : (
        <>
          <FiCopy size={16} />
          <span>Копировать</span>
        </>
      )}
    </button>
  );

  return (
    <div className={styles.legalEntityPage}>
      {/* Заголовок */}
      <div className={styles.headerSection}>
        <FiBriefcase size={48} className={styles.headerIcon} />
        <h1 className={styles.title}>Информация о юридическом лице</h1>
        <p className={styles.subtitle}>
          ООО «Интернет технологии»
        </p>
      </div>

      {/* Основная информация */}
      <div className={styles.infoSection}>
        <div className={styles.infoCard}>
          <div className={styles.cardHeader}>
            <FiFileText size={24} className={styles.cardIcon} />
            <h2 className={styles.cardTitle}>Основные реквизиты</h2>
          </div>
          
          <div className={styles.infoList}>
            <div className={styles.infoItem}>
              <div className={styles.infoLabel}>Наименование</div>
              <div className={styles.infoValue}>
                {legalInfo.name}
              </div>
            </div>

            <div className={styles.infoItem}>
              <div className={styles.infoLabel}>ИНН</div>
              <div className={styles.infoValueWithCopy}>
                <span className={styles.infoValue}>{legalInfo.inn}</span>
                <CopyButton text={legalInfo.inn} fieldName="inn" />
              </div>
            </div>

            <div className={styles.infoItem}>
              <div className={styles.infoLabel}>ОГРНИП</div>
              <div className={styles.infoValueWithCopy}>
                <span className={styles.infoValue}>{legalInfo.ogrnip}</span>
                <CopyButton text={legalInfo.ogrnip} fieldName="ogrnip" />
              </div>
            </div>

            <div className={styles.infoItem}>
              <div className={styles.infoLabel}>Юридический адрес</div>
              <div className={styles.infoValueWithCopy}>
                <span className={styles.infoValue}>{legalInfo.address}</span>
                <CopyButton text={legalInfo.address} fieldName="address" />
              </div>
            </div>
          </div>
        </div>

        {/* Банковские реквизиты */}
        <div className={styles.infoCard}>
          <div className={styles.cardHeader}>
            <FiCreditCard size={24} className={styles.cardIcon} />
            <h2 className={styles.cardTitle}>Банковские реквизиты</h2>
          </div>
          
          <div className={styles.infoList}>
            <div className={styles.infoItem}>
              <div className={styles.infoLabel}>Название банка</div>
              <div className={styles.infoValue}>{legalInfo.bank.name}</div>
            </div>

            <div className={styles.infoItem}>
              <div className={styles.infoLabel}>БИК</div>
              <div className={styles.infoValueWithCopy}>
                <span className={styles.infoValue}>{legalInfo.bank.bik}</span>
                <CopyButton text={legalInfo.bank.bik} fieldName="bik" />
              </div>
            </div>

            <div className={styles.infoItem}>
              <div className={styles.infoLabel}>Корреспондентский счет</div>
              <div className={styles.infoValueWithCopy}>
                <span className={styles.infoValue}>{legalInfo.bank.correspondentAccount}</span>
                <CopyButton text={legalInfo.bank.correspondentAccount} fieldName="correspondent" />
              </div>
            </div>

            <div className={styles.infoItem}>
              <div className={styles.infoLabel}>Расчетный счет</div>
              <div className={styles.infoValueWithCopy}>
                <span className={styles.infoValue}>{legalInfo.bank.settlementAccount}</span>
                <CopyButton text={legalInfo.bank.settlementAccount} fieldName="settlement" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Дополнительная информация */}
      <div className={styles.noteSection}>
        <div className={styles.noteCard}>
          <FiMapPin size={24} className={styles.noteIcon} />
          <h3>Местонахождение</h3>
          <p>
            Юридический адрес является официальным местом регистрации 
            организации и используется для официальной переписки.
          </p>
        </div>
        <div className={styles.noteCard}>
          <FiCreditCard size={24} className={styles.noteIcon} />
          <h3>Банковская информация</h3>
          <p>
            Все платежи и переводы должны осуществляться на указанные выше 
            банковские реквизиты. Пожалуйста, внимательно проверяйте данные 
            перед отправкой платежа.
          </p>
        </div>
      </div>
    </div>
  );
};

export default LegalEntityPage;
