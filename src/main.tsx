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
  Form,
  Button,
  Space,
  Radio,
  Statistic,
  Tag,
} from 'antd';
import Perspectives from './confs/perspective';
import Evaluation from './confs/evaluation';
import { useCallback, useEffect, useReducer, useState } from 'react';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import { CopyOutlined } from '@ant-design/icons';

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
    {}
  );

  const calculateCredit = useCallback(() => {
    const average =
      Perspectives.reduce(
        (sum, p) => sum + p.weight * (scores[p.key] || 0),
        0
      ) / Perspectives.length;
    updateCredit(average);
  }, [scores]);

  const [summary, updateSummary] = useState<string>();

  const [credit, updateCredit] = useState<number>();

  useEffect(() => {
    calculateCredit();
    console.log(credit);
  }, [scores]);

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Layout.Content style={{ backgroundColor: '#fff', padding: '2rem' }}>
        <Card style={{ borderBottom: 0, borderRadius: 0 }}>
          <Statistic title="总分" value={credit?.toFixed(2)}></Statistic>
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
                    style={{ marginTop: '1rem' }}
                  >
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
