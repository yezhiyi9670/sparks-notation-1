import React from 'react';
import clsx from 'clsx';
import styles from './styles.module.css';
import * as Icons from 'react-icons/vsc'

type FeatureItem = {
  title: string;
  icon: React.ReactNode;
  description: JSX.Element;
};

const featureIconSize = '120px'
const FeatureList: FeatureItem[] = [
  {
    title: '基于文本',
    icon: <Icons.VscFileCode fontSize={featureIconSize} />,
    description: (
      <>
        不需要鼠标键盘的一唱一和，不需要粗糙而低效的拖来拖去。键盘输入就是编辑的全部。
      </>
    ),
  },
  {
    title: '内容优先',
    icon: <Icons.VscSymbolKeyword fontSize={featureIconSize} />,
    description: (
      <>
        Sparks NMN 会尽可能帮你处理好布局相关的事情，让你能专注于乐理分析的过程。大部分情况下，你只需要做一些小调整。
      </>
    ),
  },
  {
    title: '可以启动',
    icon: <Icons.VscPlay fontSize={featureIconSize} />,
    description: (
      <>
        乐谱不再是冷冰冰的符号。Sparks NMN 支持以简单的音色播放乐谱，让你能随时听到自己的作品。乐谱，启动！
      </>
    )
  },
  {
    title: '源于实践',
    icon: <Icons.VscEdit fontSize={featureIconSize} />,
    description: (
      <>
        Sparks NMN 的灵感与设计来源于作者亲自进行的大量扒谱与记谱实践，力求贴合记谱的自然逻辑，经得起实践的检验。
      </>
    ),
  },
  {
    title: '清晰易读',
    icon: <Icons.VscSymbolMethod fontSize={featureIconSize} />,
    description: (
      <>
        相比于节省排版空间，Sparks NMN 更加重视乐谱的可读性和空间感，对各种元素设置了有差异的大小和间距，力求使乐谱的阅读轻而易举。
      </>
    ),
  },
  {
    title: '开源免费',
    icon: <Icons.VscUnlock fontSize={featureIconSize} />,
    description: (
      <>
        Sparks NMN 是开源且免费的，你可以始终不受限制地使用，还可以将其集成到自己的项目中。
      </>
    ),
  },
];

function Feature({title, icon, description}: FeatureItem) {
  return (
    <div className={clsx('col col--4')}>
      <div className="text--center">
        <div className={styles.featureSvg}>
          {icon}
        </div>
      </div>
      <div className="text--center padding-horiz--md">
        <h3>{title}</h3>
        <p>{description}</p>
      </div>
    </div>
  );
}

export default function HomepageFeatures(): JSX.Element {
  return (
    <section className={styles.features}>
      <div className="container">
        <div className="row">
          {FeatureList.map((props, idx) => (
            <Feature key={idx} {...props} />
          ))}
        </div>
      </div>
    </section>
  );
}
