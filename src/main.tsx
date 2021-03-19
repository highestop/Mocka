// 注意，polyfill 必须放在顶部
import './polyfill';
import 'antd/dist/antd.css';
import * as ReactDOM from 'react-dom';
import ReactMarkdown from 'react-markdown';
import {
  Layout,
  Row,
  Col,
  Card,
  Collapse,
  Typography,
  Input,
  Button,
  Space,
  Radio,
  Statistic,
  Tag,
  Popover,
} from 'antd';
import Perspectives from './confs/perspective';
import Evaluation from './confs/evaluation';
import { useCallback, useEffect, useReducer, useState } from 'react';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import { CopyOutlined, QuestionCircleOutlined } from '@ant-design/icons';

type PerspectiveKey = typeof Perspectives[number]['key'];

const App = () => {
  const [comments, updateComments] = useReducer(
    (
      state: { [key: string]: string },
      action: { key: PerspectiveKey; content: string }
    ) => ({
      ...state,
      [action.key]: action.content,
    }),
    {}
  );

  const [scores, updateScores] = useReducer(
    (
      state: { [key: string]: number },
      action: { key: PerspectiveKey; score: number }
    ) => ({
      ...state,
      [action.key]: action.score,
    }),
    Perspectives.reduce((scores, p) => {
      scores[p.key] = 0;
      return scores;
    }, {} as any)
  );

  const calculateCredit = useCallback(() => {
    console.log(scores);
    const average =
      Perspectives.reduce(
        (sum, p) => sum + p.weight * (scores[p.key] || 0),
        0
      ) / Perspectives.length;
    updateCredit(average);
  }, [scores]);

  const [summary, updateSummary] = useState<string>();

  const [credit, updateCredit] = useState<number>();

  useEffect(() => calculateCredit(), [scores]);

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Layout.Content style={{ backgroundColor: '#fff', padding: '2rem' }}>
        <Card style={{ borderBottom: 0, borderRadius: 0 }}>
          <Statistic
            title={
              <>
                总分
                <Popover
                  content={
                    <Typography>
                      总分会根据各项分数自动计算
                      <ul style={{ marginTop: '0.5rem' }}>
                        <li>
                          <Typography.Text strong>权重</Typography.Text>
                          ：先选择期望，不同期望下不同方面考察点的占比不同，可以在相应标题旁看到
                        </li>
                        <li>
                          <Typography.Text strong>打分</Typography.Text>：分别有
                          9 档，评分与计算分数的关系为：
                          <ul>
                            <li>
                              <Typography.Text strong>
                                0（ 未考察 ）
                              </Typography.Text>
                              : 0
                            </li>
                            {Evaluation.map(e => (
                              <li>
                                <Typography.Text strong>
                                  {e.score}
                                </Typography.Text>
                                : {e.value}
                              </li>
                            ))}
                          </ul>
                        </li>
                      </ul>
                    </Typography>
                  }
                  title={
                    <Typography.Title level={4} style={{ marginTop: '0.5rem' }}>
                      分数计算说明
                    </Typography.Title>
                  }
                  trigger="click"
                >
                  <QuestionCircleOutlined style={{ marginLeft: '0.5rem' }} />
                </Popover>
              </>
            }
            value={credit?.toFixed(2)}
          ></Statistic>
        </Card>
        <Collapse
          defaultActiveKey={Perspectives.map(p => p.key).concat(
            'summary' as any
          )}
          style={{ borderRadius: 0 }}
        >
          <Collapse.Panel
            header={<Typography.Text strong>综合评价</Typography.Text>}
            key="summary"
          >
            <Input.TextArea
              placeholder="请输入"
              rows={8}
              onChange={e => updateSummary(e.target.value)}
            ></Input.TextArea>
            <CopyToClipboard text={summary || ''}>
              <Button style={{ marginTop: '1rem' }}>
                <CopyOutlined />
                Copy
              </Button>
            </CopyToClipboard>
          </Collapse.Panel>
          {Perspectives.map(p => (
            <Collapse.Panel
              header={
                <>
                  <Typography.Text strong>{p.title}</Typography.Text>
                  <Tag color="#2db7f5" style={{ marginLeft: '0.5rem' }}>
                    {p.weight * 100}%
                  </Tag>
                </>
              }
              key={p.key}
            >
              <Row gutter={16}>
                <Col span={12}>
                  <ul>
                    {(p.desc ?? []).map((des: string) => (
                      <li key={des}>
                        <Typography>{des}</Typography>
                      </li>
                    ))}
                  </ul>
                  <Input.TextArea
                    placeholder="请输入"
                    rows={8}
                    onChange={e =>
                      updateComments({
                        key: p.key,
                        content: e.target.value,
                      })
                    }
                  ></Input.TextArea>
                  <Radio.Group
                    onChange={e =>
                      updateScores({
                        key: p.key,
                        score: e.target.value,
                      })
                    }
                    value={scores[p.key]}
                    style={{ marginTop: '1rem' }}
                  >
                    <Radio value={0} key={`${p.key}-0`}>
                      0（ 未考察 ）
                    </Radio>
                    {Evaluation.map(e => (
                      <Radio value={e.value} key={`${p.key}-${e.value}`}>
                        {e.score}
                      </Radio>
                    ))}
                  </Radio.Group>
                </Col>
                <Col span={12}>
                  <Card style={{ borderColor: '#ececec', height: '100%' }}>
                    <Space direction="vertical" size="large">
                      <CopyToClipboard text={comments[p.key]}>
                        <Button>
                          <CopyOutlined />
                          Copy
                        </Button>
                      </CopyToClipboard>
                      <Typography.Text type="secondary">
                        <ReactMarkdown
                          children={comments[p.key] || '无'}
                        ></ReactMarkdown>
                      </Typography.Text>
                    </Space>
                  </Card>
                </Col>
              </Row>
            </Collapse.Panel>
          ))}
        </Collapse>
      </Layout.Content>
      <Layout.Footer style={{ textAlign: 'center', color: 'grey' }}>
        ©Copyright by ChenYn
      </Layout.Footer>
    </Layout>
  );
};

ReactDOM.render(
  // <React.StrictMode>
  <App />,
  // </React.StrictMode>,
  document.getElementById('root')
);
