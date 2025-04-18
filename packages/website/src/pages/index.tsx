import React, { createRef, useEffect } from 'react';
import clsx from 'clsx';
import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import Layout from '@theme/Layout';
import HomepageFeatures from '@site/src/components/HomepageFeatures';

import styles from './index.module.css';
import HomepageFeatureList from '../components/HomepageFeatureList';
import { usePlaygroundUrl } from '../mdx/component/playground';
import { PreloadPlaygroundFonts } from '../mdx/component/playground';

function isAprilFoolsDay() {
  const now = new Date();

  return (now.getMonth() + 1) == 4 && now.getDate() == 1;
}

function useFooledPlaygroundUrl() {
  if(isAprilFoolsDay()) {
    return usePlaygroundUrl() + '?load-example=' + encodeURIComponent('Never Gonna Give You Up.spnmn')
  } else {
    return '/examples'
  }
}
function useFooledPlaygroundLabel() {
  if(isAprilFoolsDay()) {
    return '试玩？？？'
  } else {
    return '在线试玩'
  }
}

function HomepageHeader() {
  const {siteConfig} = useDocusaurusContext();
  const playgroundUrl = useFooledPlaygroundUrl()
  const playgroundLabel = useFooledPlaygroundLabel()

  return (
    <header className={clsx('hero hero--primary', styles.heroBanner)}>
      <div className="container">
        {/* 帮用户预加载一下 Demo（这玩意在文档里也要用到） */}
        <PreloadPlaygroundFonts />
        <h1 className="hero__title">{siteConfig.title}</h1>
        <p className="hero__subtitle">{siteConfig.tagline}</p>
        <div className={styles.buttons} style={{marginBottom: '16px'}}>
          <Link
            className="button button--secondary button--lg"
            to="docs/intro"
            style={{margin: '0 8px'}}>
            阅读指南
          </Link>
          <Link
            className="button button--secondary button--lg"
            to={playgroundUrl}
            style={{margin: '0 8px'}}>
            {playgroundLabel}
          </Link>
        </div>
        <div className={styles.buttons}>
          <Link
            className="button button--secondary button--lg"
            to='/desktop-download'
            style={{margin: '0 8px'}}>
            下载桌面版
          </Link>
        </div>
      </div>
    </header>
  );
}

export default function Home(): JSX.Element {
  const playgroundUrl = useFooledPlaygroundUrl()
  const playgroundLabel = useFooledPlaygroundLabel()

  return (
    <Layout
      description="Sparks NMN 是一个使用文本格式高效编写简谱的工具" title='用文本格式高效地编写简谱'>
      <HomepageHeader />
      <main>
        <HomepageFeatures />
        <HomepageFeatureList />
        <section style={{padding: '3rem 0', width: '100%'}}>
          <div className="container">
            <h1 style={{textAlign: 'center'}}>准备试一试?</h1>
            <div className={styles.buttons}>
              <Link
                className="button button--secondary button--lg"
                to="docs/intro"
                style={{margin: '0 8px'}}>
                阅读指南
              </Link>
              <Link
                className="button button--secondary button--lg"
                to={playgroundUrl}
                style={{margin: '0 8px'}}>
                {playgroundLabel}
              </Link>
            </div>
          </div>
        </section>
      </main>
    </Layout>
  );
}
