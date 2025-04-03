import React from 'react'
import clsx from 'clsx'
import * as Icons from 'react-icons/vsc'
import { createUseStyles } from 'react-jss';

const useStyles = createUseStyles({
  featureList: {
    padding: '2rem 0',
    width: '100%'
  },
  title1: {
    textAlign: 'center',
  },
  subtitle1: {
    textAlign: 'center',
  },
  featureIcon: {
    height: '1ex',
    transform: 'scale(2)',
    marginRight: '0.3em'
  }
})

type FeatureItem = {
  label: string
  extra?: string
  state: 'yes' | 'partial' | 'no' | 'noplan' | 'experimental'
}
type FeatureGroup = {
  label: string
  extra?: string
  features: FeatureItem[]
}

const featureGroups: FeatureGroup[] = [
  {
    label: '基本音乐',
    extra: '基本乐谱所需的功能',
    features: [
      {
        label: '标题与作者信息',
        state: 'yes',
      },
      {
        label: '混排多个乐谱片段',
        state: 'yes',
      },
      {
        label: '节奏记号',
        state: 'yes',
        extra: '用于表示念白的字母 X, Y, Z'
      },
      {
        label: '自定义减时线节奏划分',
        state: 'yes',
        extra: '语法格式隐含节奏划分的信息'
      },
      {
        label: '三连音',
        state: 'yes',
        extra: '仅支持等长的三连音'
      },
      {
        label: '转调、改变拍速与拍号',
        state: 'yes'
      },
      {
        label: '升降音',
        state: 'yes'
      },
      {
        label: '装饰音',
        state: 'yes'
      },
      {
        label: '柱状和弦',
        state: 'no'
      },
      {
        label: '插入记号',
        state: 'yes',
        extra: '支持括号、换气和层叠连缀'
      },
      {
        label: '音符奏法',
        state: 'yes',
        extra: '支持部分常见记号'
      },
      {
        label: '滑音',
        state: 'yes',
      },
      {
        label: '跳房子',
        state: 'yes',
        extra: '此记号可同时用来升降八度'
      },
      {
        label: '拆分连音线',
        state: 'yes',
        extra: '跳房子或替代旋律中可能用到'
      },
      {
        label: '反复记号',
        state: 'yes',
        extra: '支持普通反复记号和 D.S. 等记号'
      },
      {
        label: '字基歌词',
        state: 'yes',
        extra: '中文歌词的自动划分与排版'
      },
      {
        label: '词基歌词',
        state: 'yes',
        extra: '英文歌词的自动划分与排版'
      },
      {
        label: '(后略)',
        state: 'yes',
        extra: '字面意思，指音乐课本上的那个'
      }
    ]
  },
  {
    label: '高级特性',
    extra: '复杂乐谱所需要的特性',
    features: [
      {
        label: '复杂反复记号结构',
        state: 'yes',
        extra: '包括反复多次和条件反复'
      },
      {
        label: '大段文本',
        state: 'yes'
      },
      {
        label: '多声部',
        state: 'yes',
      },
      {
        label: '鼓点行',
        state: 'yes',
        extra: '鼓点行显示效果非常紧凑'
      },
      {
        label: '临时伴奏/临时多声部',
        state: 'noplan'
      },
      {
        label: '替代旋律',
        state: 'yes',
        extra: '某一段的某处使用不同旋律'
      },
      {
        label: '字基歌词内夹杂单词',
        state: 'yes',
        extra: '中文歌词内夹杂英文'
      },
      {
        label: '手动歌词划分',
        state: 'yes',
        extra: '通常没有必要使用，已不再推荐'
      },
      {
        label: '力度标记',
        state: 'yes',
      },
      {
        label: '和弦标记',
        state: 'yes',
        extra: '可基于音名或级数'
      },
      {
        label: '自定义文本标记',
        state: 'partial',
        extra: '只能标在音符行或歌词行上方'
      },
      {
        label: '吉他谱/广义和弦谱',
        state: 'no'
      },
      {
        label: '有限的五线谱功能',
        state: 'no'
      },
      {
        label: '手动分行',
        state: 'yes',
      },
      {
        label: '手动分页',
        state: 'no'
      },
      {
        label: '自定义字体',
        state: 'yes'
      },
      {
        label: '调整行间距',
        state: 'yes'
      },
      {
        label: '插入图片',
        state: 'no'
      },
      {
        label: '背景图',
        state: 'no'
      }
    ]
  },
  {
    label: '实验音乐',
    extra: '突破音乐理论的常规',
    features: [
      {
        label: '反常拍号 (如 5/8)',
        state: 'partial',
        extra: '支持任意拍号，不支持解析式'
      },
      {
        label: '摇摆节奏 (Swing)',
        state: 'yes',
        extra: '支持摇摆八分或十六分音符'
      },
      {
        label: '三等分法则',
        state: 'partial',
        extra: '教程中不介绍'
      },
      {
        label: '多连音',
        state: 'yes',
      },
      {
        label: '不完整小节',
        state: 'partial',
        extra: '目前无法在反复记号前使用'
      },
      {
        label: '复杂滑音',
        state: 'no',
      },
      {
        label: '带音高的节奏记号',
        state: 'no',
        extra: '对应五线谱的「叉形音符」'
      },
      {
        label: '广义调性',
        state: 'no',
        extra: '泛调性的简谱记法'
      },
      {
        label: '微分音',
        state: 'partial',
        extra: '有 24 平均律微分音的部分支持'
      },
    ]
  },
  {
    label: '应用与展示',
    extra: '应用形式与乐谱的展示',
    features: [
      {
        label: '自由且开源',
        state: 'yes'
      },
      {
        label: '免费使用',
        state: 'yes'
      },
      {
        label: '官方图文教程',
        state: 'yes'
      },
      {
        label: '官方参考资料',
        state: 'yes'
      },
      {
        label: '在线试用版',
        state: 'yes'
      },
      {
        label: 'Web 应用与在线存储',
        state: 'no'
      },
      {
        label: '桌面应用',
        state: 'yes'
      },
      {
        label: '移动端支持',
        extra: '在线试用模式保证移动端能看',
        state: 'partial'
      },
      {
        label: '导出 HTML',
        state: 'yes'
      },
      {
        label: '导出 JSON 数据',
        state: 'yes'
      },
      {
        label: '导出 PDF',
        state: 'no',
        extra: 'PDF 仍然可以通过打印创建'
      },
      {
        label: '导出 PNG',
        state: 'no',
      },
      {
        label: '通过命令行导出',
        extra: '以方便自动化操作',
        state: 'no',
      },
      {
        label: '以固定调显示乐谱',
        state: 'no',
      },
      {
        label: '试听查错',
        extra: '听了，并且有不少错',
        state: 'yes',
      },
      {
        label: '导出 OGG 音频',
        state: 'yes',
      },
      {
        label: '生成 MIDI',
        extra: '即将到来',
        state: 'no',

      },
      {
        label: '打印',
        state: 'yes',
        extra: '依赖系统上的浏览器工作'
      },
      {
        label: '极其优秀的性能',
        state: 'partial',
        extra: '一般能保证百毫秒级预览延时'
      },
    ]
  }
]

function FeatureItem(props: {
  item: FeatureItem
}) {
  const styles = useStyles()
  const { item } = props
  const iconSize = '22px'
  let icon = <Icons.VscCheck color='#00C853' fontSize={iconSize} className={styles.featureIcon} />
  if(item.state == 'no') {
    icon = <Icons.VscClose color='#D50000' fontSize={iconSize} className={styles.featureIcon} />
  } else if(item.state == 'partial') {
    icon = <Icons.VscWarning color='#FF6D00' fontSize={iconSize} className={styles.featureIcon} />
  } else if(item.state == 'noplan') {
    icon = <Icons.VscError color='#9E9E9E' fontSize={iconSize} className={styles.featureIcon} />
  } else if(item.state == 'experimental') {
    icon = <Icons.VscBeaker color='#00C853' fontSize={iconSize} className={styles.featureIcon} />
  }
  let titleText = {
    yes: '支持',
    no: '不支持',
    partial: '部分支持',
    noplan: '不支持且不计划支持',
    experimental: '支持，实验性特性'
  }[item.state]
  return (
    <p style={{marginBottom: '1em', display: 'flex', flexDirection: 'row', lineHeight: 1.35}}>
      <span title={titleText} style={{display: 'block'}}>
        {icon}
      </span>
      <span style={{flex: 'auto', display: 'block'}}>
        {props.item.label}
        {props.item.extra && <>
          <br />
          {'  '}
          <span style={{color: '#777', fontSize: '0.8em'}}>
            {props.item.extra}
          </span>
        </>}
      </span>
    </p>
  )
}

function FeatureGroup(props: {
  group: FeatureGroup
}) {
  return (
    <div className={clsx('col col--3')}>
      <h3 style={{textAlign: 'center'}}>{props.group.label}</h3>
      <p style={{textAlign: 'center'}}>{props.group.extra}</p>
      {props.group.features.map(item => {
        return <FeatureItem key={item.label} item={item} />
      })}
    </div>
  )
}

export default function HomepageFeatureList(): JSX.Element {
  const styles = useStyles()

  return (
    <section className={styles.featureList}>
      <div className="container">
        <h1 className={styles.title1}>尽可能完整的功能列表</h1>
        <p className={styles.subtitle1}>我们也希望告诉你缺点，避免你在不合适的东西上浪费时间</p>
        <div className="row">
          {featureGroups.map((group) => {
            return <FeatureGroup key={group.label} group={group} />
          })}
        </div>
      </div>
    </section>
  );
}
