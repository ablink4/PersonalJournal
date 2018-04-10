using System;
using System.IO;
using Microsoft.Win32;
using PortableJournal.Helpers;

namespace PortableJournal.ViewModel
{
    class ViewModelMain : ViewModelBase
    {
        private string _entryText;
        private int _entryLength;

        public ViewModelMain()
        {
            _entryText = string.Empty; 
        }

        public string EntryText
        {
            get
            {
                return _entryText;
            }
            set
            {
                _entryText = value;
                RaisePropertyChanged("EntryText");
                EntryLength = _entryText.Length; // this has to be the wrong way to do this, right?                                
            }
        }

        public int EntryLength
        {
            get
            {
                return _entryLength;
            }
            set
            {
                _entryLength = value;
                RaisePropertyChanged("EntryLength"); 
            }
        }

        public RelayCommand ExitCommand
        {
            get
            {
                return new RelayCommand(ExitApplication);
            }
        }

        void ExitApplication(object parameter)
        {
            System.Windows.Application.Current.Shutdown();
        }

        public RelayCommand SaveCommand
        {
            get
            {
                return new RelayCommand(SaveEntry);
            }
        }

        void SaveEntry(object parameter)
        {
            SaveFileDialog fileChooser = new SaveFileDialog();
            fileChooser.Filter = "Text files (*.txt)|*.txt|All files (*.*)|*.*";
            fileChooser.AddExtension = true;

            Nullable<bool> result = fileChooser.ShowDialog();

            if(result == true)
            {
                using (StreamWriter writer = new StreamWriter(fileChooser.FileName))
                {
                    writer.WriteLine(EntryText);
                }
            }
        }

        public RelayCommand OpenCommand
        {
            get
            {
                return new RelayCommand(OpenEntry);
            }
        }

        void OpenEntry(object parameter)
        {
            OpenFileDialog fileChooser = new OpenFileDialog();
            fileChooser.Filter = "Text files (*.txt)|*.txt|All files (*.*)|*.*";
            fileChooser.CheckFileExists = true;
            
            Nullable<bool> result = fileChooser.ShowDialog();

            if (result == true)
            {
                string filename = fileChooser.FileName;

                using (StreamReader reader = new StreamReader(filename))
                {
                    EntryText = reader.ReadToEnd();
                }
            }
        }

        public RelayCommand CloseCommand
        {
            get
            {
                return new RelayCommand(CloseEntry);
            }
        }

        void CloseEntry(object parameter)
        {
            EntryText = String.Empty;
        }
    }
}
