<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20250430172637 extends AbstractMigration
{
    public function getDescription(): string
    {
        return '';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->addSql('ALTER TABLE interaction DROP FOREIGN KEY FK_378DFDA7E85F12B8');
        $this->addSql('CREATE TABLE user_update (id INT AUTO_INCREMENT NOT NULL, user_id_id INT NOT NULL, created_at DATETIME NOT NULL, edited_at DATETIME NOT NULL, content VARCHAR(255) DEFAULT \'json_object()\', title VARCHAR(255) DEFAULT NULL, INDEX IDX_FD772E459D86650F (user_id_id), PRIMARY KEY(id)) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci` ENGINE = InnoDB');
        $this->addSql('ALTER TABLE user_update ADD CONSTRAINT FK_FD772E459D86650F FOREIGN KEY (user_id_id) REFERENCES user (id)');
        $this->addSql('ALTER TABLE post DROP FOREIGN KEY FK_5A8A6C8D9D86650F');
        $this->addSql('DROP TABLE post');
        $this->addSql('DROP INDEX IDX_378DFDA7E85F12B8 ON interaction');
        $this->addSql('ALTER TABLE interaction CHANGE post_id_id user_update_id_id INT NOT NULL');
        $this->addSql('ALTER TABLE interaction ADD CONSTRAINT FK_378DFDA79FEC00D7 FOREIGN KEY (user_update_id_id) REFERENCES user_update (id)');
        $this->addSql('CREATE INDEX IDX_378DFDA79FEC00D7 ON interaction (user_update_id_id)');
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->addSql('ALTER TABLE interaction DROP FOREIGN KEY FK_378DFDA79FEC00D7');
        $this->addSql('CREATE TABLE post (id INT AUTO_INCREMENT NOT NULL, user_id_id INT NOT NULL, created_at DATETIME NOT NULL, edited_at DATETIME NOT NULL, content VARCHAR(255) CHARACTER SET utf8mb4 DEFAULT \'json_object()\' COLLATE `utf8mb4_unicode_ci`, title VARCHAR(255) CHARACTER SET utf8mb4 DEFAULT NULL COLLATE `utf8mb4_unicode_ci`, INDEX IDX_5A8A6C8D9D86650F (user_id_id), PRIMARY KEY(id)) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci` ENGINE = InnoDB COMMENT = \'\' ');
        $this->addSql('ALTER TABLE post ADD CONSTRAINT FK_5A8A6C8D9D86650F FOREIGN KEY (user_id_id) REFERENCES user (id) ON UPDATE NO ACTION ON DELETE NO ACTION');
        $this->addSql('ALTER TABLE user_update DROP FOREIGN KEY FK_FD772E459D86650F');
        $this->addSql('DROP TABLE user_update');
        $this->addSql('DROP INDEX IDX_378DFDA79FEC00D7 ON interaction');
        $this->addSql('ALTER TABLE interaction CHANGE user_update_id_id post_id_id INT NOT NULL');
        $this->addSql('ALTER TABLE interaction ADD CONSTRAINT FK_378DFDA7E85F12B8 FOREIGN KEY (post_id_id) REFERENCES post (id) ON UPDATE NO ACTION ON DELETE NO ACTION');
        $this->addSql('CREATE INDEX IDX_378DFDA7E85F12B8 ON interaction (post_id_id)');
    }
}
