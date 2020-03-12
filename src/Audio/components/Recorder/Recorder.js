import React, { useContext, useEffect, useState } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { Typography, AppBar, Slide, Zoom, Tooltip } from '@material-ui/core';
import Toolbar from '@material-ui/core/Toolbar';
import IconButton from '@material-ui/core/IconButton';
import MenuIcon from '@material-ui/icons/Menu';
import BackupIcon from '@material-ui/icons/Backup';
import SettingsIcon from '@material-ui/icons/Settings';
import Mic from '@material-ui/icons/Mic';
import Fab from '@material-ui/core/Fab';
import BookIcon from '@material-ui/icons/Book';
import AutographaStore from '../../../components/AutographaStore';
import { StoreContext } from '../../context/StoreContext';
import swal from 'sweetalert';
import Timer from '../Timer';
import { default as localforage } from 'localforage';
const db = require(`${__dirname}/../../../util/data-provider`).targetDb();
const constants = require('../../../util/constants');
const { app } = require('electron').remote;
const fs = require('fs');
const path = require('path');

const useStyles = makeStyles((theme) => ({
	root: {
		flexGrow: 1,
	},
	appBar: {
		top: 0,
		position: 'fixed',
		background: '#3F5274',
		height: 65,
	},
	menuButton: {
		marginRight: theme.spacing(2),
	},
	title: {
		flexGrow: 1,
		marginLeft: 9,
	},
	soundWave: {
		maxWidth: 300,
		position: 'static',
		float: 'right',
		marginLeft: 462,
	},
	recorderToggle: {
		backgroundColor: 'white',
		color: 'red',
	},
	mic: {
		background: '#f9f1f1',
		right: 260,
	},
	TexttoSpeech: {
		marginLeft: 20,
	},
	extendedIcon: {
		[theme.breakpoints.up('xl')]: {
			right: 500,
		},
		right: 260,
	},
	chapter: {
		[theme.breakpoints.up('xl')]: {
			right: 495,
		},
		right: 257,
	},
	export: {
		right: 120,
	},
}));

export default function Recorder(props) {
	const classes = useStyles();
	const [chapter, setChapter] = useState(AutographaStore.chapterId);
	const [isOpen, SetisOpen] = useState(false);
	const [done, setdone] = useState(false);
	const {
		exportAudio,
		recVerse,
		setRecverse,
		fetchTimer,
		updateJSON,
		startRecording,
		stopRecording,
		findBook,
		findChapter,
	} = useContext(StoreContext);
	let bookId = AutographaStore.bookId.toString();
    let BookName = constants.booksList[parseInt(bookId, 10) - 1];
    const [book, setbook] = useState(BookName)
	let tempArr = [];

	useEffect(() => {
		if (props.isOpen.audioImport === true) {
			importAudio();
		}
		if ((chapter.toString() !== AutographaStore.chapterId.toString()) && isOpen === true) {
			window.location.reload();
		}
		if (isOpen === true) {
			if (AutographaStore.chunkGroup.length === recVerse.length) {
				// Get the existing data
				let existing = localStorage.getItem(BookName);
				// If no existing data, create an array
				// Otherwise, convert the localStorage string to an array
				existing = existing ? existing.split(',') : [];
                // Add new data to localStorage Array
                if(existing.indexOf(chapter.toString()) === -1){
                    existing.push(chapter);
                    localStorage.setItem(BookName, existing.toString());
                }
				setdone(true);
            } else setdone(false);
            let existingValue = localStorage.getItem(BookName);
				// If no existing data, create an array
				// Otherwise, convert the localStorage string to an array
                existingValue = existingValue ? existingValue.split(',') : [];
                AutographaStore.recordedChapters = existingValue
                
            
		}
	});

	const mountAudio = () => {
		setChapter(AutographaStore.chapterId);
		if (AutographaStore.isAudioSave !== true)
			recVerse.length === 0
				? (AutographaStore.isAudioSave = true)
				: (AutographaStore.isAudioSave = false);
		if (AutographaStore.isAudioSave === true) {
			swal({
				title: 'Are you sure?',
				text: 'You want to trigger off Audio Recording!',
				icon: 'warning',
				buttons: true,
				dangerMode: true,
			}).then((willDelete) => {
				if (willDelete) {
					AutographaStore.AudioMount = false;
					SetisOpen(false);
					localStorage.setItem('AudioMount', false);
					window.location.reload();
				} else {
					swal('Continue Recording Process');
				}
			});
		} else {
			swal({
				title: 'Cannot switch off Audio',
				text:
					'You have some newly recorded verses, Please export them to proceed!',
				icon: 'error',
				buttons: true,
				dangerMode: true,
			});
		}
	};

	const importAudio = () => {
		clearTimeout();
		localStorage.setItem('AudioMount', true);
        SetisOpen(true);
        setbook(BookName)
		setChapter(AutographaStore.chapterId);
		console.log(window.navigator.platform);
		AutographaStore.audioImport = false;
		var newfilepath = path.join(
			app.getPath('userData'),
			'recordings',
			BookName,
			`Chapter${AutographaStore.chapterId}`,
			`output.json`,
		);
		if (fs.existsSync(newfilepath)) {
			fs.readFile(
				newfilepath,
				// callback function that is called when reading file is done
				function(err, data) {
					// json data
					var jsonData = data;

					// parse json
					var jsonParsed = JSON.parse(jsonData);

					// access elements
					for (var key in jsonParsed) {
						if (jsonParsed.hasOwnProperty(key)) {
							var val = jsonParsed[key];
							setRecverse(val.verse);
							fetchTimer(val.totaltime);
							updateJSON(val);
						}
					}
				},
			);
		}
	};

	const openmic = () => {
		console.log(done);
		const { shell } = require('electron');
		shell.openExternal('ms-settings:sound');
	};
	// const handleKeyPress = (event) => {
	// 	console.log(event.key)
	// 	if(event.key === ' '){
	// 	  console.log('enter press here! ')
	// 	  startRecording()
	// 	}
	//   }
	//   const handleKeyPressUp = (event) => {
	// 	console.log(event.key)
	// 	if(event.key === ' '){
	// 	  console.log('enter press down! ')
	// 	  stopRecording()
	// 	}
	//   }
	return (
		<div>
			{props.isOpen.isOpen && (
				<React.Fragment>
					<Slide
						direction='down'
						in={props.isOpen.isOpen}
						mountOnEnter
						unmountOnExit>
						<AppBar
							position='static'
							hidden={AutographaStore.showModalBooks === true}
							className={classes.appBar}>
							<Toolbar>
								<img
									alt='Brand'
									src={require('../../../assets/images/logo.png')}
								/>
								<Typography
									variant='h5'
									className={classes.title}>
									Recorder
								</Typography>
								<span
									style={{
										right: '30%',
										left: '50%',
										position: 'absolute',
									}}>
									<Fab
										size='medium'
										className={classes.extendedIcon}
										variant='extended'>
										<BookIcon />
										{BookName}
									</Fab>
									<Fab
										size='small'
										aria-label='chapter'
										onClick={findChapter}
										className={classes.chapter}>
										{AutographaStore.chapterId}
									</Fab>
								</span>
								<span
									style={{
										right: '50%',
										left: '48%',
										position: 'absolute',
									}}>
									<Timer open={props.isOpen.isOpen} />
								</span>
								<Tooltip
									title='Turn-Off Recording Mode'
									TransitionComponent={Zoom}>
									<Fab
										aria-controls='menu-appbar'
										aria-haspopup='true'
										variant='extended'
										size='medium'
										className={classes.mic}
										onClick={mountAudio}>
										<Mic />
										Turn Off
									</Fab>
								</Tooltip>
								<span
									style={{
										right: '100%',
										left: '96%',
										position: 'absolute',
									}}>
									<Tooltip
										title='Mic Settings'
										TransitionComponent={Zoom}>
										<IconButton
											aria-controls='menu-appbar'
											aria-haspopup='true'
											size='medium'
											color='inherit'
											onClick={openmic}>
											<SettingsIcon />
										</IconButton>
									</Tooltip>
								</span>
							</Toolbar>
						</AppBar>
					</Slide>
				</React.Fragment>
			)}
		</div>
	);
}
