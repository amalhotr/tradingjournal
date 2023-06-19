import React, { useState, useEffect, useRef } from "react";
import "./App.css";
import "@aws-amplify/ui-react/styles.css";
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import ListItemButton from '@mui/material/ListItemButton';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import { createTheme, ThemeProvider, styled } from '@mui/material/styles';
import { TradingViewWidget } from "./components/TVChart"
import Grid from '@mui/material/Unstable_Grid2'; // Grid version 2
import { API } from "aws-amplify";
import logo from "./logo.svg";
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import "@aws-amplify/ui-react/styles.css";
import {
  withAuthenticator,

  Heading,
  Image,
  View,
  Card,
} from "@aws-amplify/ui-react";
import { listNotes, listTrades } from "./graphql/queries";
import {
  createNote as createNoteMutation,
  deleteNote as deleteNoteMutation,
  createTrade as createTradeMutation,
  updateTrade as updateTradeMutation,
  deleteTrade as deleteTradeMutation
} from "./graphql/mutations";

const Item = styled(Paper)(({ theme }) => ({
  ...theme.typography.body2,
  textAlign: 'center',
  color: theme.palette.text.secondary,
  height: 60,
  lineHeight: '60px',
}));

const options = [
  { id: 1, name: 'Option 1', content: 'Content for Option 1' },
  { id: 2, name: 'Option 2', content: 'Content for Option 2' },
  { id: 3, name: 'Option 3', content: 'Content for Option 3' },
]

const App = ({ signOut }) => {
  const [notes, setNotes] = useState([]);
  const [trades, setTrades] = useState([]);

  const [selectedTrade, setSelectedTrade] = useState([])
  const [selectedOption, setSelectedOption] = useState(options[0])
  const [selectedNotes, setSelectedNotes] = useState('');
  const [selectedEnter, setSelectedEnter] = useState('');
  const [selectedExit, setSelectedExit] = useState('')
  const [count, setCount] = useState(0)
  const [newTradeTicker, setNewTradeTicker] = useState('');
  const [newTradeType, setNewTradeType] = useState('');
  const [newTradeEnterTime, setNewTradeEnterTime] = useState('');
  const [newTradeExitTime, setNewTradeExitTime] = useState('');
  const [newTradeNotes, setNewTradeNotes] = useState('');
  const [newTradePnl, setNewTradePnl] = useState('');

  const [newOptionName, setNewOptionName] = useState('');
  const [newOptionContent, setNewOptionContent] = useState('');
  const [showPopup, setShowPopup] = useState(false);

  const handleOptionClick = (option) => {
    setSelectedOption(option);

  };

  const handleTradeClick = (trade) => {
    setSelectedTrade(trade);

    setSelectedNotes(trade.notes);
    setCount(count+1)
  };

  const handleNewOptionSubmit = (event) => {
    event.preventDefault();

    const newOption = {
      id: options.length + 1,
      name: newOptionName,
      content: newOptionContent,
    };

    options.push(newOption);
    setSelectedOption(newOption);
    setNewOptionName('');
    setNewOptionContent('');
    setShowPopup(false);
  };

  const handleNewTradeSubmit = (event) => {
    event.preventDefault();

    const newTrade = {
      ticker: newTradeTicker,
      type: newTradeType,
      enterTime: newTradeEnterTime,
      exitTime: newTradeExitTime,
      notes: newTradeNotes,
      pnl: newTradePnl,
    };

    createTrade(event, newTrade);

    trades.push(newTrade);
    setSelectedTrade(newTrade);
    setNewTradeTicker('');
    setNewTradeType('');
    setNewTradeEnterTime('');
    setNewTradeExitTime('');
    setNewTradeNotes('');
    setNewTradePnl('');
    setShowPopup(false);
  };


  useEffect(() => {
    fetchNotes();
    fetchTrades();
  }, []);

  async function fetchNotes() {
    const apiData = await API.graphql({ query: listNotes });
    const notesFromAPI = apiData.data.listNotes.items;
    setNotes(notesFromAPI);
  }

  async function fetchTrades() {
    const apiData = await API.graphql({ query: listTrades });
    const tradesFromAPI = apiData.data.listTrades.items;
    setTrades(tradesFromAPI);

  }

  async function createTrade(event, newTrade) {
    event.preventDefault();

    await API.graphql({
      query: createTradeMutation,
      variables: { input: newTrade },
    });
    fetchTrades();
    event.target.reset();
  }

  function formatDate(dateString){
    if (dateString == undefined){
      return ''
    }
    const month = parseInt(dateString.substring(0, 2)) - 1; // Month is zero-based (0-11)
    const day = parseInt(dateString.substring(2, 4));
    const year = parseInt(dateString.substring(4, 8));
    const hour = parseInt(dateString.substring(9, 11));
    const minute = parseInt(dateString.substring(12, 14));
    const second = parseInt(dateString.substring(15, 17));

    return new Date(year, month, day, hour, minute, second).toLocaleString('en-US', { hour12: false });
  }

  function formatPnl(origPnl){

    if (origPnl > 0){
      return  "$"+ origPnl
    }else{

      return "-$"+ Math.abs(origPnl)
    }
  }
  async function createNote(event) {
    event.preventDefault();
    const form = new FormData(event.target);
    const data = {
      name: form.get("name"),
      description: form.get("description"),
    };
    await API.graphql({
      query: createNoteMutation,
      variables: { input: data },
    });
    fetchNotes();
    event.target.reset();
  }
  async function deleteThisTrade (event){
    const id = selectedTrade.id

    deleteTrade(id)
  }
  async function deleteNote({ id }) {
    const newNotes = notes.filter((note) => note.id !== id);
    setNotes(newNotes);
    await API.graphql({
      query: deleteNoteMutation,
      variables: { input: { id } },
    });
  }

  async function deleteTrade({ id }) {
    const newTrades = notes.filter((trade) => trade.id !== id);
    setTrades(newTrades);
    console.log(id)
    await API.graphql({
      query: deleteTradeMutation,
      variables: { input: { id } },
    });
    fetchTrades()
  }

  const handleNoteChange = (event) =>{
    const tmpNotes = event.target.value;
    setSelectedNotes(tmpNotes)
  }
  const handleClose = () => {
    setShowPopup(false);
  };
  
  async function handleSubmit (event){
    event.preventDefault();

    const variables = {
      id: selectedTrade.id,
      notes: selectedNotes
    }
    await API.graphql({
      query: updateTradeMutation,
      variables: { input: variables },
    });
    fetchTrades();
    // event.target.reset();

  };
  return (
    <View className="App" style={{height:'100%'}}>
      <Heading level={1}>Ajeet's Trading Journal</Heading>
      <br></br>
      <Button onClick={signOut}>Sign Out</Button>
      
      <Dialog open={showPopup} onClose={handleClose}>
        <DialogTitle>Add New Trade</DialogTitle>
        <form onSubmit={handleNewTradeSubmit}>
        <DialogContent>
          <DialogContentText>
            Add a new trade here to keep a record
          </DialogContentText>
          
            <TextField
              autoFocus
              margin="dense"
              id="ticker"
              label="Ticker"
              fullWidth
              variant="standard"
              type="text"
              value={newTradeTicker}
              onChange={(e) => setNewTradeTicker(e.target.value)}
              />
            <TextField
              autoFocus
              margin="dense"
              id="type"
              label="Trade Type (BUY/SELL)"
              fullWidth
              variant="standard"
              type="text"
              value={newTradeType}
              onChange={(e) => setNewTradeType(e.target.value)}
            />
            <TextField
              autoFocus
              margin="dense"
              id="enter"
              label="Enter Time"
              fullWidth
              variant="standard"
              type="text"
              value={newTradeEnterTime}
              onChange={(e) => setNewTradeEnterTime(e.target.value)}
            />
            <TextField
              autoFocus
              margin="dense"
              id="exit"
              label="Exit Time"
              fullWidth
              variant="standard"
              type="text"
              value={newTradeExitTime}
              onChange={(e) => setNewTradeExitTime(e.target.value)}
            />
            <TextField
              autoFocus
              margin="dense"
              id="ticker"
              label="Ticker"
              fullWidth
              variant="standard"
              type="text"
              value={newTradePnl}
              onChange={(e) => setNewTradePnl(e.target.value)}
            />
            <TextField
              autoFocus
              margin="dense"
              id="notes"
              label="Notes"
              fullWidth
              variant="standard"
              type="text"
              value={newTradeNotes}
              onChange={(e) => setNewTradeNotes(e.target.value)}
            />

            
          </DialogContent>
          <DialogActions>
            <Button type="submit">Add</Button>
            <Button onClick={() => setShowPopup(false)}>Cancel</Button>
          </DialogActions>
        </form>
      </Dialog>
      
      <Grid container spacing={2} style={{height:'95%'}}>
        <Grid xs={2} style={{height:'90%'}}>
          <div className="scrollable-container">
            {/* <ul className="options-list">
              <li className="add-option" onClick={() => setShowPopup(true)}>
              + Add Option
              </li>
              {options.map((option) => (
                <li
                  key={option.id}
                  className={option === selectedOption ? 'selected' : ''}
                  onClick={() => handleOptionClick(option)}
                >
                  {option.name}
                </li>
              ))}
            </ul> */}
            <List>
              <ListItemButton  onClick={() => setShowPopup(true)}>
              Add New Trade
              </ListItemButton>
              {trades.map((trade) => (
                <ListItemButton
                  key={trade.id}
                  className={trade === selectedTrade ? 'selected' : ''}
                  onClick={() => handleTradeClick(trade)}
                >
                  <ListItemText primary={trade.type + " - " + trade.ticker} secondary={formatDate(trade.exitTime)}/>
                </ListItemButton>
              ))}
            </List>

          </div>
        </Grid> 
        <Grid xs={10} style={{height:'90%'}}>
          <div style={{height:'60%'}}>
            <TradingViewWidget key={count} data={selectedTrade.ticker}/>
          </div>
          <div style={{height:'35%'}}>
          <Box
            sx={{
              display: 'flex',
              flexWrap: 'wrap',
              alignitems: 'center',
              justifycontent: 'center',
              '& > :not(style)': {
                m: 1,
                width: '45%',
                height: '30%',
              },
            }}
          >
            <Item elevation={12}>
            <h2>Ticker: {selectedTrade.ticker}</h2>
            </Item>
            <Item elevation={12}>
            <h2>Transaction Type: {selectedTrade.type}</h2>
            </Item>

          </Box>
          <Box
            sx={{
              display: 'flex',
              flexWrap: 'wrap',

              '& > :not(style)': {
                m: 1,
                width: '32%',
                height: '30%',
              },
            }}
          >
            <Item elevation={12}>
            <h2>PnL: {formatPnl(selectedTrade.pnl)}</h2>
            </Item>
            <Item elevation={12}>
            <h2>Enter Time: {formatDate(selectedTrade.enterTime)}</h2>
            </Item>
            <Item elevation={12}>
            <h2>Exit Time: {formatDate(selectedTrade.exitTime)}</h2>
            </Item>
          </Box>
          <Box
            sx={{
              display: 'flex',
              flexWrap: 'wrap',
              alignitems: 'center',
              justifycontent: 'center',
              '& > :not(style)': {
                m: 1,
                width: '100%',
                height: '50%',
              },
            }}
          >
            <Item elevation={12}>
            <form onSubmit={handleSubmit}>
              {/* <ReactQuill value={selectedNotes} onChange={handleNoteChange}/> */}
              <textarea value={selectedNotes} onChange={handleNoteChange} rows="7" cols="150"></textarea>
              <Button type="submit" onClick={handleSubmit} style={{lineheight: 1}}>Submit</Button>
            </form>
            <Button  onClick={() => deleteTrade(selectedTrade)} style={{lineheight: 1}}>Delete Trade</Button>
            </Item>

          </Box>
          </div>

        </Grid> 
      </Grid>

    </View>  
    
  );
};

export default withAuthenticator(App);