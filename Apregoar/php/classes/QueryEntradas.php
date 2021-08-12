<?php

class QueryEntradas {

   private $_db;
   protected $_result;
   public $results;

   public function __construct() {
       $this->_db = new pg_connect("host=localhost dbname=postgres user=postgres password=thesis2021");       ;

       $_db = $this->_db;

       if ($_db->connect_error) {
           die('Connection Error: ' . $_db->connect_error);
       }

       return $_db;
   }

   public function getResults($params) {
       $_db = $this->_db;

       $_result = pg_prepare($_db, "my_query", 'SELECT * FROM apregoar_test.entrada_test');

       $_result = $_db->pg_execute($_db, "my_query", array()) or die('Connection Error: ' . $_db->connect_error);

       $results = array();

       while ($row = $_result->fetch_assoc()) {
           array_push($results, $row);
       }

       pg_close($_db);

       return $results;
   }

}
// https://docs.sencha.com/extjs/6.2.0/guides/backend_connectors/direct/mysql_php.html