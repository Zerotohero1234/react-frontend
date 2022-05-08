import './App.css'
import {css} from '@emotion/css'
import 'antd/dist/antd.css';
import {Modal,Input,Button,Select,DatePicker, message} from 'antd'
import TransactionRow from './Component/TransactionRow';
import { useEffect, useState } from 'react';
import styled from '@emotion/styled'
import axios from 'axios'

axios.defaults.baseURL = "https://backend-express-real.herokuapp.com/"

const PageContainer = styled.div`
  background-color:aliceblue;
  width:100vw;
  height:100vh;
  padding-top:100px;
`;

const PageContent = styled.div`
  width:80%;
  margin:auto;
  max-width:500px
`;


const mockData = [
  {
    id:"1",
    type:"expense",
    category:"Shopping",
    amount:-300,
    date:"4 april 2022",
  },
  {
    id:"2",
    type:"income",
    category:"Salary",
    amount:45000,
    date:"4 april 2022",
  }
];

const getTokenHeader = (token) => {
  return {
    headers: {
      authorization: "Bearer " + token,
    },
  }
}


function App() {

  const [createModalVisible,setCreateModalVisible] = useState(false)
  const [transactions,setTransctions] = useState(mockData)
  const [category,setCategory] = useState("Shopping");
  const [date,setDate] = useState();
  const [amount,setAmount] = useState(0);
  const [search,setSearch] = useState("");

  const [username,setUsername] = useState();
  const [password,setPassword] = useState();

  const [token,setToken] = useState();

  const fetchTransactions = async () =>{
    const response = await axios.get("/api/transactions",
    getTokenHeader(token)
    );
    console.log("response >>",response);
    setTransctions(response.data.transaction)
  }

  useEffect(()=>{
    const oldToken = localStorage.getItem("token")
    if(oldToken){
      setToken(oldToken)
    }
  })

  useEffect(()=>{
    if(token) {
      fetchTransactions();
    }
  },[token])

  const onDeleteItem = async (_id) => {
    const deleted = await axios.delete("/api/deleteTransactionn/"+ _id
    ,getTokenHeader(token));
    console.log(deleted);
    setTransctions(transactions.filter(tx => tx._id !== _id))
  }

  const filteredTransaction = transactions.filter(tx => tx.category.includes(search))

  return (
    <PageContainer>

      <div className={css`
      position:fixed;
      top: 0;
      z-index:10;
      display:flex;
      padding:16px;
      width:100%;
      background-color: white;
      `}>
      {token ? <div className={css`
      display:flex;
      `}>
        <Button onClick={()=>{
          setToken();
          localStorage.removeItem("token");
          setTransctions([]);
        }}>Logout</Button>
        {token}
        </div> : 
      <div 
      className={css`
      display:flex;
      `
      }
      >
        <Input placeholder="username" onChange={(e)=>{
         setUsername(e.target.value)
       }} /> 
       <Input placeholder="password" type="password" onChange={(e)=>{
         setPassword(e.target.value)
       }} />  
       <Button onClick={ async ()=>{
         const login = await axios.post("/user/login",{
           username,
           password
         })
         console.log("login : >>>",login);
         setToken(login.data.token)
         localStorage.setItem("token",login.data.token);
         message.success(username + " " + password)
       }}>Login</Button>
      </div>}
       
      </div>

    <PageContent>
      <div className={css`
      display:flex;
      `}>
      <Input placeholder="Search by text" onChange={(e)=>{setSearch(e.target.value)}}/>
      <Button onClick={()=>setCreateModalVisible(true)}>Create</Button>
      </div>
      {filteredTransaction.map((tx)=>{
        return <TransactionRow tx={tx} onDeleteItem={onDeleteItem}/>
      })}
    </PageContent>

      
      <Modal title="Basic Modal" visible={createModalVisible} 
      
      onOk={ async ()=>{
        const incomeCategory = ["Saraly"]
        const expenseCategory = ["Shopping"]
        const type = incomeCategory.includes(category) ? "income" : "expense"
        const newTx = {
            type,
            category,
            date,
            amount
        }
        const created = await axios.post(
          "/api/transaction",
          newTx,
          getTokenHeader(token));
          message.success("Create transaction success")
          console.log("newtx >>",newTx);

        setTransctions([...transactions,newTx])
        setCreateModalVisible(false)}}
         onCancel={()=>setCreateModalVisible(false)}
      >
        <div className={css`
        display:flex;
        flex-direction:column;
        height:150px;
        justify-content:space-between;
        `}
        >
          <Select placeholder="Selecct your cataegory" onChange={(e)=>console.log(setCategory(e))}>
            <Select.Option value="Shopping">Shoping</Select.Option>
            <Select.Option value="Salary">Salary</Select.Option>
          </Select>
          <DatePicker onChange={(e)=>setDate(e.format("DD MM YYYY"))}/>
          <Input placeholder="input amount" onChange={((e)=>setAmount(e.target.value))}/>
          </div>
      </Modal>
  </PageContainer>
  )
}

export default App
