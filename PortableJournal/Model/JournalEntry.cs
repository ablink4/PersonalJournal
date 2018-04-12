using System;

namespace PortableJournal.Model
{
    public class JournalEntry
    {
        private string _name;
        private DateTime _timestamp;
        private string _topic;
        private string _fulltext;
        private string _summary;
        
        public JournalEntry(string name)
        {
            _name = name;
            _timestamp = DateTime.Now;
            _topic = String.Empty;
            _fulltext = String.Empty;
            _summary = String.Empty;
        } 
    }
}
