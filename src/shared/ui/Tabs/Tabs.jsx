import styles from './Tabs.module.css';

/**
 * Компонент Tabs для переключения между вкладками
 * @param {Object} props
 * @param {Array<{key: string, label: string, icon?: React.ReactNode}>} props.tabs - Массив вкладок
 * @param {string} props.activeTab - Ключ активной вкладки
 * @param {function} props.onTabChange - Callback при смене вкладки
 * @param {'horizontal' | 'vertical'} props.orientation - Ориентация вкладок (по умолчанию 'horizontal')
 */
const Tabs = ({ tabs, activeTab, onTabChange, orientation = 'horizontal' }) => {
  return (
    <div className={`${styles.tabs} ${styles[orientation]}`}>
      <div className={styles.tabList} role="tablist">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            role="tab"
            aria-selected={activeTab === tab.key}
            aria-controls={`panel-${tab.key}`}
            id={`tab-${tab.key}`}
            className={`${styles.tab} ${activeTab === tab.key ? styles.active : ''}`}
            onClick={() => onTabChange(tab.key)}
          >
            {tab.icon && <span className={styles.tabIcon}>{tab.icon}</span>}
            <span className={styles.tabLabel}>{tab.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default Tabs;
